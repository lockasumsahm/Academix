// Column lists that exclude privacy-sensitive columns which the database
// no longer exposes to other users (profiles.email) or to anonymous
// visitors (professors.contact_email).
export const PROFILE_PUBLIC_COLUMNS =
  "id, full_name, university, major, research_interests, created_at, headline, bio, avatar_url, cover_url, country, city, education_level, graduation_year, skills, languages, website_url, scholar_url, linkedin_url, github_url, orcid, open_to_collaboration, profile_completed, updated_at";

export const PROFESSOR_PUBLIC_COLUMNS =
  "id, full_name, university_id, department, research_areas, lab_name, profile_link, scholar_link, researchgate_link, accepting_students, created_at";
