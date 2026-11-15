import "server-only";
import { z } from "zod";

// Swagger property names/nullability remain literal. Only the documented frontend tolerances below are added.
export const ServicesCreate = z.object({
  "nameAr": z.string().nullable().optional(),
  "nameEn": z.string().nullable().optional(),
  "simpleDescriptionAr": z.string().nullable().optional(),
  "simpleDescriptionEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "order": z.int32().optional(),
  "fileId": z.int32().nullable().optional(),
  isActive: z.boolean().optional()
}).strict();

export const ServicesUpdate = z.object({
  "nameAr": z.string().nullable().optional(),
  "nameEn": z.string().nullable().optional(),
  "simpleDescriptionAr": z.string().nullable().optional(),
  "simpleDescriptionEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "order": z.int32().optional(),
  "fileId": z.int32().nullable().optional(),
  "isActive": z.boolean().optional(),
  id: z.int32().optional()
}).strict();

export const FAQsCreate = z.object({
  "questionAr": z.string().nullable().optional(),
  "questionEn": z.string().nullable().optional(),
  "answerAr": z.string().nullable().optional(),
  "answerEn": z.string().nullable().optional(),
  isActive: z.boolean().optional()
}).strict();

export const FAQsUpdate = z.object({
  "questionAr": z.string().nullable().optional(),
  "questionEn": z.string().nullable().optional(),
  "answerAr": z.string().nullable().optional(),
  "answerEn": z.string().nullable().optional(),
  "isActive": z.boolean().optional(),
  id: z.int32().optional()
}).strict();

export const OurSpecialistsCreate = z.object({
  "nameAr": z.string().nullable().optional(),
  "nameEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "specialistAr": z.string().nullable().optional(),
  "specialistEn": z.string().nullable().optional(),
  "fileId": z.int32().nullable().optional(),
  isActive: z.boolean().optional()
}).strict();

export const OurSpecialistsUpdate = z.object({
  "nameAr": z.string().nullable().optional(),
  "nameEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "specialistAr": z.string().nullable().optional(),
  "specialistEn": z.string().nullable().optional(),
  "fileId": z.int32().nullable().optional(),
  "isActive": z.boolean().optional(),
  id: z.int32().optional()
}).strict();

export const TestimonialsCreate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "starNumber": z.int32().optional(),
  "fileId": z.int32().nullable().optional(),
  isActive: z.boolean().optional()
}).strict();

export const TestimonialsUpdate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "starsNumber": z.int32().optional(),
  "fileId": z.int32().nullable().optional(),
  "isActive": z.boolean().optional(),
  id: z.int32().optional(),
  starNumber: z.int32().optional()
}).strict();

export const GalleriesCreate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "beforeFileId": z.int32().nullable().optional(),
  "afterFileId": z.int32().nullable().optional(),
  isActive: z.boolean().optional()
}).strict();

export const GalleriesUpdate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "beforeFileId": z.int32().nullable().optional(),
  "afterFileId": z.int32().nullable().optional(),
  "isActive": z.boolean().optional(),
  id: z.int32().optional()
}).strict();

export const YouTubeGalleriesCreate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "videoUrl": z.string().nullable().optional(),
  isActive: z.boolean().optional()
}).strict();

export const YouTubeGalleriesUpdate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "descriptionAr": z.string().nullable().optional(),
  "descriptionEn": z.string().nullable().optional(),
  "videoUrl": z.string().nullable().optional(),
  "isActive": z.boolean().optional(),
  id: z.int32().optional()
}).strict();

export const BlogPostsCreate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "summaryAr": z.string().nullable().optional(),
  "summaryEn": z.string().nullable().optional(),
  "contentAr": z.string().nullable().optional(),
  "contentEn": z.string().nullable().optional(),
  "ourSpecialistId": z.int32().optional(),
  "metaTitleAr": z.string().nullable().optional(),
  "metaTitleEn": z.string().nullable().optional(),
  "metaDescriptionAr": z.string().nullable().optional(),
  "metaDescriptionEn": z.string().nullable().optional(),
  "status": z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  "isFeatured": z.boolean().optional(),
  "order": z.int32().optional(),
  "fileId": z.int32().nullable().optional(),
  isActive: z.boolean().optional()
}).strict();

export const BlogPostsUpdate = z.object({
  "titleAr": z.string().nullable().optional(),
  "titleEn": z.string().nullable().optional(),
  "summaryAr": z.string().nullable().optional(),
  "summaryEn": z.string().nullable().optional(),
  "contentAr": z.string().nullable().optional(),
  "contentEn": z.string().nullable().optional(),
  "ourSpecialistId": z.int32().optional(),
  "metaTitleAr": z.string().nullable().optional(),
  "metaTitleEn": z.string().nullable().optional(),
  "metaDescriptionAr": z.string().nullable().optional(),
  "metaDescriptionEn": z.string().nullable().optional(),
  "status": z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  "isFeatured": z.boolean().optional(),
  "order": z.int32().optional(),
  "fileId": z.int32().nullable().optional(),
  "isActive": z.boolean().optional(),
  id: z.int32().optional()
}).strict();

export const SettingUpdate = z.object({
  "phoneNumber": z.string().nullable().optional(),
  "email": z.string().nullable().optional(),
  "address": z.string().nullable().optional(),
  "aboutUs_Ar": z.string().nullable().optional(),
  "aboutUs_En": z.string().nullable().optional(),
  "contactUs_Ar": z.string().nullable().optional(),
  "contactUs_En": z.string().nullable().optional(),
  "latitude": z.number().finite().nullable().optional(),
  "longitude": z.number().finite().nullable().optional(),
  "facebookUrl": z.string().nullable().optional(),
  "instagramUrl": z.string().nullable().optional(),
  "twitterUrl": z.string().nullable().optional(),
  "youtubeUrl": z.string().nullable().optional(),
  "tiktokUrl": z.string().nullable().optional(),
  "faQsTabToggle": z.boolean().optional(),
  "servicesTabToggle": z.boolean().optional(),
  "galleriesTabToggle": z.boolean().optional(),
  "youTubeGalleriesTabToggle": z.boolean().optional(),
  "testimonialsTabToggle": z.boolean().optional(),
  "ourSpecialistsTabToggle": z.boolean().optional()
}).strict();

export const AdsUpdate = z.object({
  "text": z.string().nullable().optional(),
  "isExternal": z.boolean().optional(),
  "url": z.string().nullable().optional(),
  "fileId": z.int32().nullable().optional(),
  "isActive": z.boolean().optional()
}).strict();

