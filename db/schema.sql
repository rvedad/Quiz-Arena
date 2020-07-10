CREATE SCHEMA "public";
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"name" varchar(100) NOT NULL CONSTRAINT "categories_name_key" UNIQUE,
	"description" text,
	"question_count" integer DEFAULT 0 NOT NULL
);
CREATE TABLE "category_points" (
	"user_id" integer,
	"category_id" integer,
	"points" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "category_points_pkey" PRIMARY KEY("user_id","category_id")
);
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY,
	"category_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"option_c" text NOT NULL,
	"option_d" text NOT NULL,
	"correct_option" char(1) NOT NULL,
	CONSTRAINT "questions_correct_option_check" CHECK ((correct_option = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar])))
);
CREATE TABLE "quiz_answers" (
	"id" serial PRIMARY KEY,
	"attempt_id" integer NOT NULL,
	"question_id" integer,
	"selected_option" char(1),
	"is_correct" boolean NOT NULL,
	"time_taken_sec" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "quiz_answers_selected_option_check" CHECK ((selected_option = ANY (ARRAY['A'::bpchar, 'B'::bpchar, 'C'::bpchar, 'D'::bpchar])))
);
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL,
	"category_id" integer,
	"total_questions" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" varchar(50) NOT NULL CONSTRAINT "users_username_key" UNIQUE,
	"email" varchar(100) NOT NULL CONSTRAINT "users_email_key" UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL
);
CREATE UNIQUE INDEX "categories_name_key" ON "categories" ("name");
CREATE UNIQUE INDEX "categories_pkey" ON "categories" ("id");
CREATE UNIQUE INDEX "category_points_pkey" ON "category_points" ("user_id","category_id");
CREATE UNIQUE INDEX "questions_pkey" ON "questions" ("id");
CREATE UNIQUE INDEX "quiz_answers_pkey" ON "quiz_answers" ("id");
CREATE UNIQUE INDEX "quiz_attempts_pkey" ON "quiz_attempts" ("id");
CREATE UNIQUE INDEX "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX "users_pkey" ON "users" ("id");
CREATE UNIQUE INDEX "users_username_key" ON "users" ("username");
ALTER TABLE "category_points" ADD CONSTRAINT "category_points_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;
ALTER TABLE "category_points" ADD CONSTRAINT "category_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE;
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE SET NULL;
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;