package com.qwizle.api.questions;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

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
        OffsetDateTime now = OffsetDateTime.now(clock);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        namedParameterJdbcTemplate.update("""
                INSERT INTO basic_questions (created_by_user_id, question_text, answer_text, created_at, updated_at)
                VALUES (:createdByUserId, :questionText, :answerText, :createdAt, :updatedAt)
                """,
                new MapSqlParameterSource()
                        .addValue("createdByUserId", user.id())
                        .addValue("questionText", request.question().trim())
                        .addValue("answerText", request.answer().trim())
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
                SELECT id, created_by_user_id, question_text, answer_text, created_at
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
        String submittedAnswer = request.answer().trim();
        boolean correct = normalize(submittedAnswer).equals(normalize(question.answer()));
        OffsetDateTime now = OffsetDateTime.now(clock);

        jdbcClient.sql("""
                INSERT INTO basic_question_attempts (question_id, attempted_by_user_id, submitted_answer, correct, attempted_at)
                VALUES (:questionId, :attemptedByUserId, :submittedAnswer, :correct, :attemptedAt)
                """)
                .param("questionId", question.id())
                .param("attemptedByUserId", user.id())
                .param("submittedAnswer", submittedAnswer)
                .param("correct", correct)
                .param("attemptedAt", now)
                .update();

        return new BasicQuestionAttemptResponse(question.id(), submittedAnswer, correct, now);
    }

    private Optional<BasicQuestionRecord> findQuestion(Long questionId) {
        return jdbcClient.sql("""
                SELECT id, created_by_user_id, question_text, answer_text, created_at
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
                rs.getObject("created_at", OffsetDateTime.class));
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private record BasicQuestionRecord(Long id, Long createdByUserId, String question, String answer, OffsetDateTime createdAt) {
        BasicQuestionResponse toResponse() {
            return new BasicQuestionResponse(id, question, createdByUserId, createdAt);
        }
    }
}
