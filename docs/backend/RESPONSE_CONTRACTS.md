> Phase6 integration note: frontend/public mappers and all Phase3–5 DTO/envelope contracts remain unchanged. Internal transport reuses the actual existing response mappers/authorization, not raw SQL or a generic fake envelope. Dashboard login/session still returns user/expiresOn only; upload still fileId/filePath; no JWT enters browser JSON. The adapter safely extracts string/structured error messages. Existing sampled legacy GET evidence remains scoped; local integration tests do not retroactively verify undocumented legacy writes/admin/auth success. See CUTOVER_COMPATIBILITY_REPORT and END_TO_END_TEST_REPORT.

> Phase5 current upload contract: [FILE_API_CONTRACT](FILE_API_CONTRACT.md). Success exactly retains isSuccess/data{fileId:number,filePath:string}/error:null/paging:null from actual ImageUpload source. Upload failures use string error plus top-level message for its existing consumers; this endpoint-specific new policy does not replace content/Auth structured errors. No upload response was observed from legacy. Actual unchanged TSX input/response handling and URL helper behavior passed against real SQL/storage in tests; browser/host PDF rendering and cutover remain unverified.

> Phase 4 current implementation, 2026-11-11: all 43 content operations are isolated and SQL/HTTP tested. The original observations below remain historical evidence, not universal schemas. See [CONTENT_API_CONTRACTS](CONTENT_API_CONTRACTS.md) for explicit DTOs, operation inventory and INFERRED branches. Seventeen public success GET shapes and three error profiles are compared against sanitized fixtures. Testimonial reads preserve legacy starsNumber plus a frontend starNumber alias; errors preserve the structured object plus top-level message. Dates retain offset-free ISO strings and SQL precision (six/seven fractional digits observed; UTC instant meaning remains UNKNOWN). Null/default policies, writes, administrative settings/ads/statistics, active ads and sort/status/slug policies are new contracts. No complete historical parity or frontend cutover is claimed.

# عقود الاستجابة — ما هو مثبت وما هو غير معروف

تاريخ GET observations: 2026-11-11. المرجع الأساسي هو المستهلك الفعلي، ثم البنية المرصودة. جميع response schemas غائبة في Swagger. لم تنفذ POST/PUT/DELETE ضد legacy. لم تُقرأ APIs المستخدمين ولم تُستخدم credentials. حفظت أشكال وأنواع فقط، لا النصوص أو الصور أو الأسماء أو الهواتف أو البريد أو JWTs.

## قواعد التصنيف

VERIFIED_FROM_FRONTEND يثبت ما يحتاجه الكود فقط؛ VERIFIED_FROM_LEGACY_RESPONSE يثبت العينة/الفرع المرصود فقط؛ DOCUMENTED_IN_OPENAPI لا يثبت response body هنا؛ INFERRED تصميم مستقبلي؛ UNKNOWN فجوة ينبغي إبقاؤها صريحة.

## R-ENVELOPE / R-LIST / R-DETAIL

المشاهد في قوائم المحتوى: `{isSuccess:boolean,data:T[],error:null,paging:{pageNumber:number,pageSize:number,totalRecords:number}}`. التفاصيل: `{isSuccess:true,data:T,error:null,paging:null}`. القائمة الفارغة: data=[]، totalRecords=0، وبقاء pageNumber/pageSize. هذه ملاحظات فعلية، لا تعميم على عمليات الكتابة أو المصادقة.

`lib/api/client.ts` يفحص HTTP ثم isSuccess، ويعيد payload كاملاً. `MainType` في dashboard يسمح isSuccess اختياريًا ويفرض paging بالـ types؛ استخدامه في settings لا يثبت أن paging object فعلاً، إذ المشاهد singleton/detail يرسل null. لا تُعدّل DTOs؛ يجب أن يعيد backend البنية التي يستهلكها كل caller.

## DTOs المثبتة من source ومن GET

| Profile | data fields | Evidence / caveat |
| --- | --- | --- |
| R-Services | id:number; nameAr/nameEn/simpleDescriptionAr/simpleDescriptionEn/descriptionAr/descriptionEn:string; order:number; avatar:{id:number,filePath:string} أو null; createdAt:string; isActive:boolean | كلا المصدرين؛ null للـ avatar مرصود رغم أن ServicesInterface في dashboard لا يصرح به |
| R-FAQs | id; questionAr/questionEn/answerAr/answerEn; createdAt; isActive | source + GET |
| R-OurSpecialists | id; nameAr/nameEn/descriptionAr/descriptionEn/specialistAr/specialistEn; image:{id,filePath} أو null حسب frontend؛ createdAt; isActive | source + GET للفرع غير null؛ null مسموح في types وليس مرصودًا في كل عينة |
| R-Galleries | id; titleAr/titleEn/descriptionAr/descriptionEn; beforeImage/afterImage:{id,filePath} أو null حسب types؛ createdAt; isActive | source + GET |
| R-YouTubeGalleries | id; titleAr/titleEn/descriptionAr/descriptionEn/videoUrl; createdAt; isActive | source + GET |
| R-BlogPosts | id; titleAr/titleEn/slug/summaryAr/summaryEn/contentAr/contentEn; ourSpecialistId; ourSpecialist: nested specialist أو null؛ metaTitleAr/metaTitleEn/metaDescriptionAr/metaDescriptionEn; status:number; isFeatured:boolean; order:number; image:{id,filePath} أو null؛ createdAt/updatedAt; isActive | source + GET list/detail/by-slug؛ أسماء الحقول المتداخلة محفوظة |
| R-Testimonials | نفس id/titleAr/titleEn/descriptionAr/descriptionEn/avatar/createdAt/isActive؛ **legacy يرسل starsNumber** بينما frontend يطلب **starNumber** | تعارض مثبت، وليس تطابقًا؛ U02 |
| R-SETTINGS | phoneNumber,email,address,aboutUs_Ar,aboutUs_En,contactUs_Ar,contactUs_En,facebookUrl,instagramUrl,twitterUrl,youtubeUrl,tiktokUrl؛ latitude/longitude:number؛ faQsTabToggle/servicesTabToggle/galleriesTabToggle/youTubeGalleriesTabToggle/testimonialsTabToggle/ourSpecialistsTabToggle:boolean | Client/get-settings مثبت GET؛ نجاح Setting/get للمصادق فقط غير مفحوص |
| R-CLIENT-ADS | text:null, url:null, isActive:boolean في العينة | شكل الإعلان المفعّل/الصورة/isExternal غير مثبت؛ لا تُستنتج فروع من عينة inactive |

الأسماء الثنائية Ar/En جزء من JSON، لا تُحذف عند تغيير Accept-Language. frontend يختار الحقل بنفسه. أنواع id/content order/rating في source هي number؛ تنفيذ SQL المقترح INT، لا string أو decimal-encoded-as-string. قائمة خصائص nested/file الدقيقة موجودة في الملحق الآمن أدناه.

## R-ERROR: تعارض آخر في envelope

GET 400، 401، 404 أعاد فعليًا `{isSuccess:false,data:null,error:{code:string,message:string,details:null},paging:null}`. أما frontend public type فيصف error:string|null؛ وaxios يبحث غالبًا في `response.data.message` وليس error.message؛ كما أن login adapter يفترض error قد يكون string. لا يصح الادعاء أن type يحكي الأصل. لا تُغير callers. المقترح الذي يحتاج قرار توافق: إبقاء error object القديم مع message علوي كـ alias كي تعمل toasts، أو adapter server-only يعرض message بالواجهة المحلية دون تغيير /api الأصلي. الزيادة يجب توثيقها ولا تُنسب إلى legacy. نصوص/أكواد الأخطاء ودقة الترجمة UNKNOWN ولم تُحفظ قيمها.

## R-LOGIN-UPSTREAM مقابل R-SESSION-LOCAL

- upstream `POST /api/auth/login`: server adapter يقرأ `data.id,email,role,token,expiresOn`؛ هذه VERIFIED_FROM_FRONTEND، وليست response legacy مرصودة. بقية envelope/حقول الهوية/OTP challenge UNKNOWN.
- browser `POST /dashboard/api/session/login` وGET /dashboard/api/session: `{user:{id:string,email:string,role:string|number},expiresOn:string}`، **بلا token**. هذا عقد محلي حالي، وليس واحدًا من 57.
- GET session 401 وPOST logout 204 يظلان كما هما. Cookie: lapis_admin_session؛ HttpOnly؛ Strict؛ Path=/dashboard؛ Secure production؛ cap 3500 bytes. قراءة JWT الآن decode فقط؛ البديل يجب أن يتحقق من التوقيع فعليًا قبل DB/domain access.
- isAdminRole يقبل 1/2 وSuperAdmin/Manager/Admin وصيغها الحالية؛ لا دليل login legacy يثبت التمثيل الفعلي. tokens ذات sub/id/nameidentifier، email/emailaddress/unique_name، role/.NET role URI وexp مطلوبة للـ adapter الحالي.
- LoginRequest في Swagger يحتوي code، بينما UI/adapter الحالي يرسلان email/password فقط. لا يوجد مسار UI مكتمل لتحدي 2FA؛ لا تصنع bypass للتحقق.

## R-UPLOAD

VERIFIED_FROM_FRONTEND: multipart field `file`؛ `{isSuccess:boolean,data:{fileId:number,filePath:string}|null,error:string|null,paging:unknown}`. uploader يضع fileId في Formik ويستخدم filePath للمعاينة. هذا ليس DTO الصورة المتداخلة الذي يستخدم `id`، وليس دليلًا على استجابة كتابة legacy. لا تعاد تسمية fileId إلى id. الحد الحالي 4 MiB مع framing محدود في proxy، ويجب أن يخضع له endpoint الجديد أيضًا عند الوصول المباشر. PDF preview يستخدم iframe، والصور تستخدم img.

## R-MUTATION / R-UNKNOWN

create/update/remove تعيد response.data دون فحص shape فعلي في معظم الخدمات. MainDialog يغلق على resolve ويستخدم toast.promise؛ ليس دليلًا أن خطأ HTTP 200 مع isSuccess=false يُفهم كفشل. response data قد يكون id/object/null ولا يوجد دليل يختار بينها. Ads/admin settings/statistics/User/registration/email/OTP/reset/2FA success responses غير مثبتة؛ لا يُعمم envelope ناجح موحد عليها.

## Query/casing/date observations

- Services أظهر أن PageNumber/PageSize وpageNumber/pageSize يعملان بنفس paging؛ casing aliases مثبتة هنا فقط، ويقترح binder مماثل للمستهلكين الآخرين دون تغيير spelling canonical.
- OurSpecialists مع perPage=1&page=2 رجع pageNumber=1,pageSize=10: هذه المفاتيح تُتجاهل في العينة، ولا ينبغي تحويلها تلقائيًا إلى pagination مختلفة تحت اسم التوافق.
- ar/en/ku قُبلت واحتفظت الحقول الثنائية بنفس البنية؛ هذا لا يثبت fallback أو ترجمة الأخطاء أو sorting collation.
- createdAt/updatedAt المرصودة ISO-like **بلا offset**؛ التخزين المقترح UTC لا يبرر إضافة Z إلى الاستجابة دون اختبار. راجع U10 لقياس الكسور ومراعاة Date في المتصفح.

## ملحق بنيوي آمن من GET observations

هذه الدفعة توثق 28 طلب GET، لا طلبات كتابة. المعروض **تمثيل بنيوي للأنواع وليس payload فعليًا**: `{array:[…]}` يصف الأنواع المختلفة لعناصر array، ولا يعني وجود property اسمها array في wire response. لا توجد قيم شخصية أو tokens أو محتوى مقالات. /get-by-id و/by-slug في عينات النجاح تعني معرفًا/slug من قائمة عامة دون حفظ قيمته؛ عينة not_found منفصلة.

### FAQs_list

`GET /api/FAQs/get-all?PageNumber=1&PageSize=2&IsActive=true`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "questionEn": "string",
        "questionAr": "string",
        "answerEn": "string",
        "answerAr": "string",
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### Services_list

`GET /api/Services/get-all?PageNumber=1&PageSize=2&IsActive=true`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "simpleDescriptionAr": "string",
        "simpleDescriptionEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "order": "number",
        "avatar": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      },
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "simpleDescriptionAr": "string",
        "simpleDescriptionEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "order": "number",
        "avatar": "null",
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### OurSpecialists_list

`GET /api/OurSpecialists/get-all?PageNumber=1&PageSize=2&IsActive=true`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "specialistAr": "string",
        "specialistEn": "string",
        "image": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### FAQs_detail

`GET /api/FAQs/get-by-id/{known-id}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "questionEn": "string",
    "questionAr": "string",
    "answerEn": "string",
    "answerAr": "string",
    "createdAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### Services_detail

`GET /api/Services/get-by-id/{known-id}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "nameAr": "string",
    "nameEn": "string",
    "simpleDescriptionAr": "string",
    "simpleDescriptionEn": "string",
    "descriptionAr": "string",
    "descriptionEn": "string",
    "order": "number",
    "avatar": {
      "id": "number",
      "filePath": "string"
    },
    "createdAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### OurSpecialists_detail

`GET /api/OurSpecialists/get-by-id/{known-id}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "nameAr": "string",
    "nameEn": "string",
    "descriptionAr": "string",
    "descriptionEn": "string",
    "specialistAr": "string",
    "specialistEn": "string",
    "image": {
      "id": "number",
      "filePath": "string"
    },
    "createdAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### Testimonials_list

`GET /api/Testimonials/get-all?PageNumber=1&PageSize=2&IsActive=true`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "titleAr": "string",
        "titleEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "starsNumber": "number",
        "avatar": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      },
      {
        "id": "number",
        "titleAr": "string",
        "titleEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "starsNumber": "number",
        "avatar": "null",
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### YouTubeGalleries_list

`GET /api/YouTubeGalleries/get-all?PageNumber=1&PageSize=2&IsActive=true`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "titleAr": "string",
        "titleEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "videoUrl": "string",
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### Galleries_list

`GET /api/Galleries/get-all?PageNumber=1&PageSize=2&IsActive=true`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "titleAr": "string",
        "titleEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "beforeImage": {
          "id": "number",
          "filePath": "string"
        },
        "afterImage": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### Testimonials_detail

`GET /api/Testimonials/get-by-id/{known-id}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "titleAr": "string",
    "titleEn": "string",
    "descriptionAr": "string",
    "descriptionEn": "string",
    "starsNumber": "number",
    "avatar": {
      "id": "number",
      "filePath": "string"
    },
    "createdAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### YouTubeGalleries_detail

`GET /api/YouTubeGalleries/get-by-id/{known-id}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "titleAr": "string",
    "titleEn": "string",
    "descriptionAr": "string",
    "descriptionEn": "string",
    "videoUrl": "string",
    "createdAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### Galleries_detail

`GET /api/Galleries/get-by-id/{known-id}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "titleAr": "string",
    "titleEn": "string",
    "descriptionAr": "string",
    "descriptionEn": "string",
    "beforeImage": {
      "id": "number",
      "filePath": "string"
    },
    "afterImage": {
      "id": "number",
      "filePath": "string"
    },
    "createdAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### BlogPosts_list

`GET /api/BlogPosts/get-all?PageNumber=1&PageSize=2&IsActive=true`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "titleAr": "string",
        "titleEn": "string",
        "slug": "string",
        "summaryAr": "string",
        "summaryEn": "string",
        "contentAr": "string",
        "contentEn": "string",
        "ourSpecialistId": "number",
        "ourSpecialist": {
          "id": "number",
          "nameAr": "string",
          "nameEn": "string",
          "descriptionAr": "string",
          "descriptionEn": "string",
          "specialistAr": "string",
          "specialistEn": "string",
          "image": {
            "id": "number",
            "filePath": "string"
          },
          "createdAt": "string(date-time,no-offset)",
          "isActive": "boolean"
        },
        "metaTitleAr": "string",
        "metaTitleEn": "string",
        "metaDescriptionAr": "string",
        "metaDescriptionEn": "string",
        "status": "number",
        "isFeatured": "boolean",
        "order": "number",
        "image": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "updatedAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### BlogPosts_detail

`GET /api/BlogPosts/get-by-id/{known-id}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "titleAr": "string",
    "titleEn": "string",
    "slug": "string",
    "summaryAr": "string",
    "summaryEn": "string",
    "contentAr": "string",
    "contentEn": "string",
    "ourSpecialistId": "number",
    "ourSpecialist": {
      "id": "number",
      "nameAr": "string",
      "nameEn": "string",
      "descriptionAr": "string",
      "descriptionEn": "string",
      "specialistAr": "string",
      "specialistEn": "string",
      "image": {
        "id": "number",
        "filePath": "string"
      },
      "createdAt": "string(date-time,no-offset)",
      "isActive": "boolean"
    },
    "metaTitleAr": "string",
    "metaTitleEn": "string",
    "metaDescriptionAr": "string",
    "metaDescriptionEn": "string",
    "status": "number",
    "isFeatured": "boolean",
    "order": "number",
    "image": {
      "id": "number",
      "filePath": "string"
    },
    "createdAt": "string(date-time,no-offset)",
    "updatedAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### BlogPosts_slug

`GET /api/BlogPosts/by-slug/{known-slug}`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "id": "number",
    "titleAr": "string",
    "titleEn": "string",
    "slug": "string",
    "summaryAr": "string",
    "summaryEn": "string",
    "contentAr": "string",
    "contentEn": "string",
    "ourSpecialistId": "number",
    "ourSpecialist": {
      "id": "number",
      "nameAr": "string",
      "nameEn": "string",
      "descriptionAr": "string",
      "descriptionEn": "string",
      "specialistAr": "string",
      "specialistEn": "string",
      "image": {
        "id": "number",
        "filePath": "string"
      },
      "createdAt": "string(date-time,no-offset)",
      "isActive": "boolean"
    },
    "metaTitleAr": "string",
    "metaTitleEn": "string",
    "metaDescriptionAr": "string",
    "metaDescriptionEn": "string",
    "status": "number",
    "isFeatured": "boolean",
    "order": "number",
    "image": {
      "id": "number",
      "filePath": "string"
    },
    "createdAt": "string(date-time,no-offset)",
    "updatedAt": "string(date-time,no-offset)",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### /api/Client/get-settings

`GET /api/Client/get-settings`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "phoneNumber": "string",
    "email": "string",
    "address": "string",
    "aboutUs_Ar": "string",
    "aboutUs_En": "string",
    "contactUs_Ar": "string",
    "contactUs_En": "string",
    "facebookUrl": "string",
    "instagramUrl": "string",
    "twitterUrl": "string",
    "youtubeUrl": "string",
    "tiktokUrl": "string",
    "latitude": "number",
    "longitude": "number",
    "faQsTabToggle": "boolean",
    "servicesTabToggle": "boolean",
    "galleriesTabToggle": "boolean",
    "youTubeGalleriesTabToggle": "boolean",
    "testimonialsTabToggle": "boolean",
    "ourSpecialistsTabToggle": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### /api/Setting/get-statistic

`GET /api/Setting/get-statistic`؛ Accept-Language=ar؛ HTTP=401.

```json
{
  "isSuccess": "boolean",
  "data": "null",
  "error": {
    "code": "string",
    "message": "string",
    "details": "null"
  },
  "paging": "null"
}
```

### /api/Ads/get

`GET /api/Ads/get`؛ Accept-Language=ar؛ HTTP=401.

```json
{
  "isSuccess": "boolean",
  "data": "null",
  "error": {
    "code": "string",
    "message": "string",
    "details": "null"
  },
  "paging": "null"
}
```

### /api/Setting/get

`GET /api/Setting/get`؛ Accept-Language=ar؛ HTTP=401.

```json
{
  "isSuccess": "boolean",
  "data": "null",
  "error": {
    "code": "string",
    "message": "string",
    "details": "null"
  },
  "paging": "null"
}
```

### /api/Client/get-ads

`GET /api/Client/get-ads`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "text": "null",
    "url": "null",
    "isActive": "boolean"
  },
  "error": "null",
  "paging": "null"
}
```

### query_lowercase

`GET /api/Services/get-all?pageNumber=2&pageSize=1&search=`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "simpleDescriptionAr": "string",
        "simpleDescriptionEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "order": "number",
        "avatar": "null",
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### query_pascal

`GET /api/Services/get-all?PageNumber=2&PageSize=1&Search=`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "simpleDescriptionAr": "string",
        "simpleDescriptionEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "order": "number",
        "avatar": "null",
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### autocomplete_aliases

`GET /api/OurSpecialists/get-all?perPage=1&page=2&search=`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "specialistAr": "string",
        "specialistEn": "string",
        "image": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### query_empty

`GET /api/Services/get-all?PageNumber=1&PageSize=1&Search=__lapis_contract_audit_no_match__`؛ Accept-Language=ar؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": []
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### query_invalid_int

`GET /api/Services/get-all?PageSize=invalid`؛ Accept-Language=ar؛ HTTP=400.

```json
{
  "isSuccess": "boolean",
  "data": "null",
  "error": {
    "code": "string",
    "message": "string",
    "details": "null"
  },
  "paging": "null"
}
```

### not_found

`GET /api/Services/get-by-id/{missing-id}`؛ Accept-Language=ar؛ HTTP=404. استُخدم int32 غير موجود، وليس ID من سجلات المستخدمين.

```json
{
  "isSuccess": "boolean",
  "data": "null",
  "error": {
    "code": "string",
    "message": "string",
    "details": "null"
  },
  "paging": "null"
}
```

### language_en

`GET /api/Services/get-all?PageNumber=1&PageSize=1&IsActive=true`؛ Accept-Language=en؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "simpleDescriptionAr": "string",
        "simpleDescriptionEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "order": "number",
        "avatar": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```

### language_ku

`GET /api/Services/get-all?PageNumber=1&PageSize=1&IsActive=true`؛ Accept-Language=ku؛ HTTP=200.

```json
{
  "isSuccess": "boolean",
  "data": {
    "array": [
      {
        "id": "number",
        "nameAr": "string",
        "nameEn": "string",
        "simpleDescriptionAr": "string",
        "simpleDescriptionEn": "string",
        "descriptionAr": "string",
        "descriptionEn": "string",
        "order": "number",
        "avatar": {
          "id": "number",
          "filePath": "string"
        },
        "createdAt": "string(date-time,no-offset)",
        "isActive": "boolean"
      }
    ]
  },
  "error": "null",
  "paging": {
    "pageNumber": "number",
    "pageSize": "number",
    "totalRecords": "number"
  }
}
```
