-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.blog_authors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  bio text,
  avatar_url text,
  CONSTRAINT blog_authors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blog_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  CONSTRAINT blog_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blog_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_comments_pkey PRIMARY KEY (id),
  CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT blog_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id)
);
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  h1 text,
  excerpt text,
  content text NOT NULL,
  image_url text,
  author_id uuid,
  category_id uuid,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.blog_authors(id),
  CONSTRAINT blog_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id)
);
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  h1 text,
  description text NOT NULL,
  long_description text,
  image_url text,
  price numeric NOT NULL,
  level text,
  duration text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exam_answers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question_id uuid,
  answer text NOT NULL,
  is_correct boolean DEFAULT false,
  CONSTRAINT exam_answers_pkey PRIMARY KEY (id),
  CONSTRAINT exam_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.exam_questions(id)
);
CREATE TABLE public.exam_attempt_answers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  attempt_id uuid,
  question_id uuid,
  answer_id uuid,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exam_attempt_answers_pkey PRIMARY KEY (id),
  CONSTRAINT exam_attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.exam_attempts(id),
  CONSTRAINT exam_attempt_answers_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.exam_answers(id),
  CONSTRAINT exam_attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.exam_questions(id)
);
CREATE TABLE public.exam_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  exam_id uuid,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  score numeric,
  CONSTRAINT exam_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT exam_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT exam_attempts_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id)
);
CREATE TABLE public.exam_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exam_id uuid,
  question text NOT NULL,
  order_index integer NOT NULL,
  CONSTRAINT exam_questions_pkey PRIMARY KEY (id),
  CONSTRAINT exam_questions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id)
);
CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  course_id uuid,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.landing_benefits (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  section_id uuid,
  title text NOT NULL,
  description text,
  icon_url text,
  order_index integer,
  CONSTRAINT landing_benefits_pkey PRIMARY KEY (id),
  CONSTRAINT landing_benefits_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.landing_sections(id)
);
CREATE TABLE public.landing_sections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  h1 text,
  title text,
  description text,
  content text,
  image_url text,
  order_index integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT landing_sections_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  module_id uuid,
  title text NOT NULL,
  h1 text,
  description text,
  content text,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  course_id uuid,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  library_id text,
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  lesson_id uuid,
  completed boolean DEFAULT false,
  last_position integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT progress_pkey PRIMARY KEY (id),
  CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  course_id uuid,
  stripe_subscription_id text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'canceled'::text, 'past_due'::text])),
  current_period_end timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT subscriptions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  avatar_url text,
  content text NOT NULL,
  featured boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT testimonials_pkey PRIMARY KEY (id)
);
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lesson_id uuid,
  bunny_video_id text NOT NULL,
  title text,
  description text,
  duration text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);