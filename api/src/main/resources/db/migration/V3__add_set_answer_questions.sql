ALTER TABLE basic_questions
    ADD COLUMN question_type VARCHAR(32) NOT NULL DEFAULT 'SINGLE_ANSWER';

ALTER TABLE basic_questions
    ADD COLUMN solution_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE basic_questions
    ADD CONSTRAINT chk_basic_questions_solution_count_positive CHECK (solution_count > 0);
