package com.qwizle.api.questions;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import com.qwizle.api.auth.UserProfile;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BasicQuestionService {
    private final JdbcClient jdbcClient;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final Clock clock;

    public BasicQuestionService(JdbcClient jdbcClient, NamedParameterJdbcTemplate namedParameterJdbcTemplate, Clock clock) {
        this.jdbcClient = jdbcClient;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.clock = clock;
    }

    public BasicQuestionResponse create(UserProfile user, CreateBasicQuestionRequest request) {
        QuestionType type = request.type() == null ? QuestionType.SINGLE_ANSWER : request.type();
        PreparedAnswer preparedAnswer = prepareAnswer(type, request);
        OffsetDateTime now = OffsetDateTime.now(clock);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        namedParameterJdbcTemplate.update("""
                INSERT INTO basic_questions (created_by_user_id, question_text, answer_text, question_type, solution_count, created_at, updated_at)
                VALUES (:createdByUserId, :questionText, :answerText, :questionType, :solutionCount, :createdAt, :updatedAt)
                """,
                new MapSqlParameterSource()
                        .addValue("createdByUserId", user.id())
                        .addValue("questionText", request.question().trim())
                        .addValue("answerText", preparedAnswer.storedAnswer())
                        .addValue("questionType", type.name())
                        .addValue("solutionCount", preparedAnswer.solutionCount())
                        .addValue("createdAt", now)
                        .addValue("updatedAt", now),
                keyHolder,
                new String[] { "id" });

        return findQuestion(keyHolder.getKey().longValue())
                .orElseThrow(() -> new IllegalStateException("Created question could not be loaded."))
                .toResponse();
    }

    public List<BasicQuestionResponse> list() {
        return jdbcClient.sql("""
                SELECT id, created_by_user_id, question_text, answer_text, question_type, solution_count, created_at
                FROM basic_questions
                ORDER BY created_at DESC, id DESC
                """)
                .query(this::mapRecord)
                .list()
                .stream()
                .map(BasicQuestionRecord::toResponse)
                .toList();
    }

    public BasicQuestionAttemptResponse attempt(UserProfile user, Long questionId, AttemptBasicQuestionRequest request) {
        BasicQuestionRecord question = findQuestion(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        AttemptEvaluation evaluation = evaluateAttempt(question, request);
        OffsetDateTime now = OffsetDateTime.now(clock);

        jdbcClient.sql("""
                INSERT INTO basic_question_attempts (question_id, attempted_by_user_id, submitted_answer, correct, attempted_at)
                VALUES (:questionId, :attemptedByUserId, :submittedAnswer, :correct, :attemptedAt)
                """)
                .param("questionId", question.id())
                .param("attemptedByUserId", user.id())
                .param("submittedAnswer", evaluation.storedSubmittedAnswer())
                .param("correct", evaluation.correct())
                .param("attemptedAt", now)
                .update();

        return new BasicQuestionAttemptResponse(
                question.id(),
                evaluation.submittedAnswer(),
                evaluation.submittedAnswers(),
                evaluation.correct(),
                now);
    }

    private Optional<BasicQuestionRecord> findQuestion(Long questionId) {
        return jdbcClient.sql("""
                SELECT id, created_by_user_id, question_text, answer_text, question_type, solution_count, created_at
                FROM basic_questions
                WHERE id = :questionId
                """)
                .param("questionId", questionId)
                .query(this::mapRecord)
                .optional();
    }

    private BasicQuestionRecord mapRecord(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new BasicQuestionRecord(
                rs.getLong("id"),
                rs.getLong("created_by_user_id"),
                rs.getString("question_text"),
                rs.getString("answer_text"),
                QuestionType.valueOf(rs.getString("question_type")),
                rs.getInt("solution_count"),
                rs.getObject("created_at", OffsetDateTime.class));
    }

    private PreparedAnswer prepareAnswer(QuestionType type, CreateBasicQuestionRequest request) {
        if (type == QuestionType.SINGLE_ANSWER) {
            String answer = request.answer() == null ? "" : request.answer().trim();
            if (answer.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer is required.");
            }
            return new PreparedAnswer(answer, 1);
        }

        List<String> answers = cleanAnswers(request.answers());
        if (answers.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set questions require at least two answers.");
        }
        ensureUniqueAnswers(answers);
        return new PreparedAnswer(String.join("\n", answers), answers.size());
    }

    private AttemptEvaluation evaluateAttempt(BasicQuestionRecord question, AttemptBasicQuestionRequest request) {
        if (question.type() == QuestionType.SINGLE_ANSWER) {
            String submittedAnswer = request.answer() == null ? "" : request.answer().trim();
            if (submittedAnswer.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answer is required.");
            }
            boolean correct = normalize(submittedAnswer).equals(normalize(question.answer()));
            return new AttemptEvaluation(submittedAnswer, List.of(), submittedAnswer, correct);
        }

        List<String> submittedAnswers = cleanAnswers(request.answers());
        if (submittedAnswers.size() != question.solutionCount()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submit exactly " + question.solutionCount() + " answers.");
        }

        Set<String> expected = normalizedSet(List.of(question.answer().split("\n")));
        Set<String> submitted = normalizedSet(submittedAnswers);
        boolean correct = expected.equals(submitted) && submittedAnswers.size() == submitted.size();
        return new AttemptEvaluation(null, submittedAnswers, String.join("\n", submittedAnswers), correct);
    }

    private List<String> cleanAnswers(List<String> answers) {
        if (answers == null) {
            return List.of();
        }
        List<String> cleanedAnswers = new ArrayList<>();
        for (String answer : answers) {
            String cleanedAnswer = answer == null ? "" : answer.trim();
            if (cleanedAnswer.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set answers cannot be blank.");
            }
            cleanedAnswers.add(cleanedAnswer);
        }
        return cleanedAnswers;
    }

    private void ensureUniqueAnswers(List<String> answers) {
        if (normalizedSet(answers).size() != answers.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set answers must be unique.");
        }
    }

    private Set<String> normalizedSet(List<String> answers) {
        Set<String> normalizedAnswers = new LinkedHashSet<>();
        for (String answer : answers) {
            normalizedAnswers.add(normalize(answer));
        }
        return normalizedAnswers;
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private record BasicQuestionRecord(Long id, Long createdByUserId, String question, String answer, QuestionType type, int solutionCount, OffsetDateTime createdAt) {
        BasicQuestionResponse toResponse() {
            return new BasicQuestionResponse(id, question, type, solutionCount, createdByUserId, createdAt);
        }
    }

    private record PreparedAnswer(String storedAnswer, int solutionCount) {
    }

    private record AttemptEvaluation(String submittedAnswer, List<String> submittedAnswers, String storedSubmittedAnswer, boolean correct) {
    }
}
