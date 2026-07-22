export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EduChat",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "sameAs": [
    "https://twitter.com/educhat",
    "https://facebook.com/educhat"
  ]
});

export const generateTutorProfileSchema = (tutor: any) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": tutor.name,
  "jobTitle": "Tutor",
  "worksFor": {
    "@type": "Organization",
    "name": "EduChat"
  },
  "url": `https://yourdomain.com/tutor/${tutor.id}`,
  "image": tutor.avatarUrl
});

export const generateCourseSchema = (course: any, tutor: any) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": course.name,
  "description": course.description || `A course taught by ${tutor.name}`,
  "provider": {
    "@type": "Person",
    "name": tutor.name,
    "url": `https://yourdomain.com/tutor/${tutor.id}`
  }
});
