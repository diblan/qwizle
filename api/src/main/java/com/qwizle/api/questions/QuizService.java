package com.qwizle.api.questions;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.qwizle.api.auth.UserProfile;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class QuizService {
    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final Clock clock;

    public QuizService(NamedParameterJdbcTemplate jdbcTemplate, Clock clock) {
        this.jdbcTemplate = jdbcTemplate;
        this.clock = clock;
    }

    @Transactional
    public QuizResponse create(UserProfile user, CreateQuizRequest request) {
        List<Long> questionIds = cleanQuestionIds(request.questionIds());
        validateQuestionIds(questionIds);

        OffsetDateTime now = OffsetDateTime.now(clock);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update("""
                INSERT INTO quizzes (created_by_user_id, title, description, created_at, updated_at)
                VALUES (:createdByUserId, :title, :description, :createdAt, :updatedAt)
                """,
                new MapSqlParameterSource()
                        .addValue("createdByUserId", user.id())
                        .addValue("title", request.title().trim())
                        .addValue("description", cleanDescription(request.description()))
                        .addValue("createdAt", now)
                        .addValue("updatedAt", now),
                keyHolder,
                new String[] { "id" });

        Long quizId = keyHolder.getKey().longValue();
        List<MapSqlParameterSource> rows = new ArrayList<>();
        for (int index = 0; index < questionIds.size(); index++) {
            rows.add(new MapSqlParameterSource()
                    .addValue("quizId", quizId)
                    .addValue("questionId", questionIds.get(index))
                    .addValue("position", index + 1));
        }
        jdbcTemplate.batchUpdate("""
                INSERT INTO quiz_questions (quiz_id, question_id, position)
                VALUES (:quizId, :questionId, :position)
                """, rows.toArray(MapSqlParameterSource[]::new));

        return findQuiz(quizId).orElseThrow(() -> new IllegalStateException("Created quiz could not be loaded."));
    }

    public List<QuizResponse> list() {
        return hydrateQuizzes(jdbcTemplate.query("""
                SELECT id, created_by_user_id, title, description, created_at
                FROM quizzes
                ORDER BY created_at DESC, id DESC
                """, new MapSqlParameterSource(), this::mapQuizSummary));
    }

    private java.util.Optional<QuizResponse> findQuiz(Long quizId) {
        List<QuizSummary> summaries = jdbcTemplate.query("""
                SELECT id, created_by_user_id, title, description, created_at
                FROM quizzes
                WHERE id = :quizId
                """, new MapSqlParameterSource("quizId", quizId), this::mapQuizSummary);
        return hydrateQuizzes(summaries).stream().findFirst();
    }

    private List<QuizResponse> hydrateQuizzes(List<QuizSummary> summaries) {
        if (summaries.isEmpty()) {
            return List.of();
        }

        List<Long> quizIds = summaries.stream().map(QuizSummary::id).toList();
        Map<Long, List<BasicQuestionResponse>> questionsByQuizId = new LinkedHashMap<>();
        for (Long quizId : quizIds) {
            questionsByQuizId.put(quizId, new ArrayList<>());
        }

        jdbcTemplate.query("""
                SELECT qq.quiz_id, bq.id, bq.created_by_user_id, bq.question_text, bq.question_type, bq.solution_count, bq.created_at
                FROM quiz_questions qq
                JOIN basic_questions bq ON bq.id = qq.question_id
                WHERE qq.quiz_id IN (:quizIds)
                ORDER BY qq.quiz_id, qq.position
                """, new MapSqlParameterSource("quizIds", quizIds), rs -> {
            Long quizId = rs.getLong("quiz_id");
            questionsByQuizId.get(quizId).add(mapQuestion(rs));
        });

        return summaries.stream()
                .map(summary -> {
                    List<BasicQuestionResponse> questions = List.copyOf(questionsByQuizId.getOrDefault(summary.id(), List.of()));
                    return new QuizResponse(
                            summary.id(),
                            summary.title(),
                            summary.description(),
                            questions.size(),
                            questions,
                            summary.createdByUserId(),
                            summary.createdAt());
                })
                .toList();
    }

    private List<Long> cleanQuestionIds(List<Long> questionIds) {
        if (questionIds == null) {
            return List.of();
        }
        return questionIds.stream().filter(id -> id != null).toList();
    }

    private void validateQuestionIds(List<Long> questionIds) {
        if (questionIds.size() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose at least two questions for the quiz.");
        }
        Set<Long> uniqueIds = new HashSet<>(questionIds);
        if (uniqueIds.size() != questionIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz questions must be unique.");
        }

        Integer existingCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM basic_questions
                WHERE id IN (:questionIds)
                """, new MapSqlParameterSource("questionIds", questionIds), Integer.class);
        if (existingCount == null || existingCount != questionIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Questions must exist before they can be added to a quiz.");
        }
    }

    private String cleanDescription(String description) {
        if (description == null || description.trim().isBlank()) {
            return null;
        }
        return description.trim();
    }

    private QuizSummary mapQuizSummary(ResultSet rs, int rowNumber) throws SQLException {
        return new QuizSummary(
                rs.getLong("id"),
                rs.getLong("created_by_user_id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getObject("created_at", OffsetDateTime.class));
    }

    private BasicQuestionResponse mapQuestion(ResultSet rs) throws SQLException {
        return new BasicQuestionResponse(
                rs.getLong("id"),
                rs.getString("question_text"),
                QuestionType.valueOf(rs.getString("question_type")),
                rs.getInt("solution_count"),
                rs.getLong("created_by_user_id"),
                rs.getObject("created_at", OffsetDateTime.class));
    }

    private record QuizSummary(Long id, Long createdByUserId, String title, String description, OffsetDateTime createdAt) {
    }
}
