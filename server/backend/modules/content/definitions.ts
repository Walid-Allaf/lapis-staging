import "server-only";
import * as schemas from "./validation";
import type { Field, ResourceDefinition } from "./types";

// Explicit module-specific SQL/DTO definitions. Sort meanings are proposed, not legacy-verified.
export const ServicesDefinition: ResourceDefinition = {
  name: "Services", table: "Services",
  fields: [
  {
    "property": "nameAr",
    "column": "NameAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "nameEn",
    "column": "NameEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "simpleDescriptionAr",
    "column": "SimpleDescriptionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "simpleDescriptionEn",
    "column": "SimpleDescriptionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionAr",
    "column": "DescriptionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionEn",
    "column": "DescriptionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "order",
    "column": "SortOrder",
    "kind": "integer",
    "nullable": false
  },
  {
    "property": "fileId",
    "column": "FileId",
    "kind": "integer",
    "nullable": true,
    "reference": "file",
    "image": "avatar"
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
],
  searchColumns: ["NameAr","NameEn","SimpleDescriptionAr","SimpleDescriptionEn","DescriptionAr","DescriptionEn"],
  sortColumns: ["Id","NameAr","NameEn","SimpleDescriptionAr","SimpleDescriptionEn","DescriptionAr","DescriptionEn","SortOrder","CreatedAtUtc"], defaultSort: 7,
  create: schemas.ServicesCreate, update: schemas.ServicesUpdate,
};

export const FAQsDefinition: ResourceDefinition = {
  name: "FAQs", table: "FAQs",
  fields: [
  {
    "property": "questionAr",
    "column": "QuestionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "questionEn",
    "column": "QuestionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "answerAr",
    "column": "AnswerAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "answerEn",
    "column": "AnswerEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
],
  searchColumns: ["QuestionAr","QuestionEn","AnswerAr","AnswerEn"],
  sortColumns: ["Id","QuestionAr","QuestionEn","CreatedAtUtc"], defaultSort: 0,
  create: schemas.FAQsCreate, update: schemas.FAQsUpdate,
};

export const OurSpecialistsDefinition: ResourceDefinition = {
  name: "OurSpecialists", table: "OurSpecialists",
  fields: [
  {
    "property": "nameAr",
    "column": "NameAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "nameEn",
    "column": "NameEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionAr",
    "column": "DescriptionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionEn",
    "column": "DescriptionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "specialistAr",
    "column": "SpecialistAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "specialistEn",
    "column": "SpecialistEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "fileId",
    "column": "FileId",
    "kind": "integer",
    "nullable": true,
    "reference": "file",
    "image": "image"
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
],
  searchColumns: ["NameAr","NameEn","DescriptionAr","DescriptionEn","SpecialistAr","SpecialistEn"],
  sortColumns: ["Id","NameAr","NameEn","DescriptionAr","DescriptionEn","SpecialistAr","SpecialistEn","CreatedAtUtc"], defaultSort: 0,
  create: schemas.OurSpecialistsCreate, update: schemas.OurSpecialistsUpdate,
};

export const TestimonialsDefinition: ResourceDefinition = {
  name: "Testimonials", table: "Testimonials",
  fields: [
  {
    "property": "titleAr",
    "column": "TitleAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "titleEn",
    "column": "TitleEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionAr",
    "column": "DescriptionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionEn",
    "column": "DescriptionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "starNumber",
    "column": "Rating",
    "kind": "integer",
    "nullable": false
  },
  {
    "property": "fileId",
    "column": "FileId",
    "kind": "integer",
    "nullable": true,
    "reference": "file",
    "image": "avatar"
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
],
  searchColumns: ["TitleAr","TitleEn","DescriptionAr","DescriptionEn"],
  sortColumns: ["Id","TitleAr","TitleEn","DescriptionAr","DescriptionEn","Rating","CreatedAtUtc"], defaultSort: 0,
  create: schemas.TestimonialsCreate, update: schemas.TestimonialsUpdate,
};

export const GalleriesDefinition: ResourceDefinition = {
  name: "Galleries", table: "Galleries",
  fields: [
  {
    "property": "titleAr",
    "column": "TitleAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "titleEn",
    "column": "TitleEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionAr",
    "column": "DescriptionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionEn",
    "column": "DescriptionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "beforeFileId",
    "column": "BeforeFileId",
    "kind": "integer",
    "nullable": true,
    "reference": "file",
    "image": "beforeImage"
  },
  {
    "property": "afterFileId",
    "column": "AfterFileId",
    "kind": "integer",
    "nullable": true,
    "reference": "file",
    "image": "afterImage"
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
],
  searchColumns: ["TitleAr","TitleEn","DescriptionAr","DescriptionEn"],
  sortColumns: ["Id","TitleAr","TitleEn","DescriptionAr","DescriptionEn","CreatedAtUtc","IsActive"], defaultSort: 0,
  create: schemas.GalleriesCreate, update: schemas.GalleriesUpdate,
};

export const YouTubeGalleriesDefinition: ResourceDefinition = {
  name: "YouTubeGalleries", table: "YouTubeGalleries",
  fields: [
  {
    "property": "titleAr",
    "column": "TitleAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "titleEn",
    "column": "TitleEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionAr",
    "column": "DescriptionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "descriptionEn",
    "column": "DescriptionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "videoUrl",
    "column": "VideoUrl",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
],
  searchColumns: ["TitleAr","TitleEn","DescriptionAr","DescriptionEn","VideoUrl"],
  sortColumns: ["Id","TitleAr","TitleEn","DescriptionAr","DescriptionEn","VideoUrl","CreatedAtUtc"], defaultSort: 0,
  create: schemas.YouTubeGalleriesCreate, update: schemas.YouTubeGalleriesUpdate,
};

export const BlogPostsDefinition: ResourceDefinition = {
  name: "BlogPosts", table: "BlogPosts",
  fields: [
  {
    "property": "titleAr",
    "column": "TitleAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "titleEn",
    "column": "TitleEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "summaryAr",
    "column": "SummaryAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "summaryEn",
    "column": "SummaryEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "contentAr",
    "column": "ContentAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "contentEn",
    "column": "ContentEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "ourSpecialistId",
    "column": "OurSpecialistId",
    "kind": "integer",
    "nullable": false,
    "reference": "specialist"
  },
  {
    "property": "metaTitleAr",
    "column": "MetaTitleAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "metaTitleEn",
    "column": "MetaTitleEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "metaDescriptionAr",
    "column": "MetaDescriptionAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "metaDescriptionEn",
    "column": "MetaDescriptionEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "status",
    "column": "Status",
    "kind": "integer",
    "nullable": false
  },
  {
    "property": "isFeatured",
    "column": "IsFeatured",
    "kind": "boolean",
    "nullable": false
  },
  {
    "property": "order",
    "column": "SortOrder",
    "kind": "integer",
    "nullable": false
  },
  {
    "property": "fileId",
    "column": "FileId",
    "kind": "integer",
    "nullable": true,
    "reference": "file",
    "image": "image"
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
],
  searchColumns: ["TitleAr","TitleEn","SummaryAr","SummaryEn","ContentAr","ContentEn","MetaTitleAr","MetaTitleEn","MetaDescriptionAr","MetaDescriptionEn"],
  sortColumns: ["Id","TitleAr","TitleEn","Slug","SummaryAr","SummaryEn","ContentAr","ContentEn","OurSpecialistId","MetaTitleAr","MetaTitleEn","MetaDescriptionAr","MetaDescriptionEn","Status","IsFeatured","SortOrder","CreatedAtUtc","UpdatedAtUtc"], defaultSort: 15,
  create: schemas.BlogPostsCreate, update: schemas.BlogPostsUpdate,
};

export const resources = { Services: ServicesDefinition, FAQs: FAQsDefinition, OurSpecialists: OurSpecialistsDefinition, Testimonials: TestimonialsDefinition, Galleries: GalleriesDefinition, YouTubeGalleries: YouTubeGalleriesDefinition, BlogPosts: BlogPostsDefinition } as const;
export const settingFields: readonly Field[] = [
  {
    "property": "phoneNumber",
    "column": "PhoneNumber",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "email",
    "column": "Email",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "address",
    "column": "Address",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "aboutUs_Ar",
    "column": "AboutUsAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "aboutUs_En",
    "column": "AboutUsEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "contactUs_Ar",
    "column": "ContactUsAr",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "contactUs_En",
    "column": "ContactUsEn",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "latitude",
    "column": "Latitude",
    "kind": "double",
    "nullable": true
  },
  {
    "property": "longitude",
    "column": "Longitude",
    "kind": "double",
    "nullable": true
  },
  {
    "property": "facebookUrl",
    "column": "FacebookUrl",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "instagramUrl",
    "column": "InstagramUrl",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "twitterUrl",
    "column": "TwitterUrl",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "youtubeUrl",
    "column": "YoutubeUrl",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "tiktokUrl",
    "column": "TiktokUrl",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "faQsTabToggle",
    "column": "FAQsTabToggle",
    "kind": "boolean",
    "nullable": false
  },
  {
    "property": "servicesTabToggle",
    "column": "ServicesTabToggle",
    "kind": "boolean",
    "nullable": false
  },
  {
    "property": "galleriesTabToggle",
    "column": "GalleriesTabToggle",
    "kind": "boolean",
    "nullable": false
  },
  {
    "property": "youTubeGalleriesTabToggle",
    "column": "YouTubeGalleriesTabToggle",
    "kind": "boolean",
    "nullable": false
  },
  {
    "property": "testimonialsTabToggle",
    "column": "TestimonialsTabToggle",
    "kind": "boolean",
    "nullable": false
  },
  {
    "property": "ourSpecialistsTabToggle",
    "column": "OurSpecialistsTabToggle",
    "kind": "boolean",
    "nullable": false
  }
];
export const adsFields: readonly Field[] = [
  {
    "property": "text",
    "column": "Text",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "isExternal",
    "column": "IsExternal",
    "kind": "boolean",
    "nullable": false
  },
  {
    "property": "url",
    "column": "Url",
    "kind": "string",
    "nullable": true
  },
  {
    "property": "fileId",
    "column": "FileId",
    "kind": "integer",
    "nullable": true,
    "reference": "file",
    "image": "file"
  },
  {
    "property": "isActive",
    "column": "IsActive",
    "kind": "boolean",
    "nullable": false
  }
];
