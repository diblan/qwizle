package com.qwizle.api.questions;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class QuestionService {
    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final Map<QuestionType, QuestionTypeHandler<?, ?>> handlers;

    public QuestionService(
            NamedParameterJdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper,
            Clock clock,
            List<QuestionTypeHandler<?, ?>> handlers) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.clock = clock;
        this.handlers = new EnumMap<>(QuestionType.class);
        for (QuestionTypeHandler<?, ?> handler : handlers) {
            this.handlers.put(handler.type(), handler);
        }
    }

    @Transactional
    public QuestionResponse create(UserProfile user, CreateQuestionRequest request) {
        QuestionPrompt prompt = cleanPrompt(request.prompt());
        List<String> tags = cleanTags(request.tags());
        QuestionTypeHandler<Object, Object> handler = handlerFor(request.type());
        Object definition = readJson(request.definition(), handler.definitionClass(), "Question definition is invalid.");
        handler.validateDefinition(definition);

        OffsetDateTime now = OffsetDateTime.now(clock);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update("""
                INSERT INTO questions (
                    created_by_user_id, type, prompt_text, prompt_media_json, definition_json,
                    explanation, difficulty, created_at, updated_at
                )
                VALUES (
                    :createdByUserId, :type, :promptText, :promptMediaJson, :definitionJson,
                    :explanation, :difficulty, :createdAt, :updatedAt
                )
                """,
                new MapSqlParameterSource()
                        .addValue("createdByUserId", user.id())
                        .addValue("type", request.type().name())
                        .addValue("promptText", prompt.text())
                        .addValue("promptMediaJson", writeJson(prompt.media()))
                        .addValue("definitionJson", writeJson(definition))
                        .addValue("explanation", cleanOptional(request.explanation()))
                        .addValue("difficulty", cleanOptional(request.difficulty()))
                        .addValue("createdAt", now)
                        .addValue("updatedAt", now),
                keyHolder,
                new String[] { "id" });

        Long questionId = keyHolder.getKey().longValue();
        insertTags(questionId, tags);
        return findQuestion(questionId)
                .orElseThrow(() -> new IllegalStateException("Created question could not be loaded."))
                .toResponse(handler, definition, tags);
    }

    public List<QuestionResponse> list() {
        List<QuestionRecord> questions = jdbcTemplate.query("""
                SELECT id, created_by_user_id, type, prompt_text, prompt_media_json, definition_json,
                       explanation, difficulty, created_at
                FROM questions
                ORDER BY created_at DESC, id DESC
                """, new MapSqlParameterSource(), this::mapQuestion);
        Map<Long, List<String>> tagsByQuestionId = loadTags(questions.stream().map(QuestionRecord::id).toList());
        return questions.stream()
                .map(question -> question.toResponse(handlerFor(question.type()), readDefinition(question), tagsByQuestionId.getOrDefault(question.id(), List.of())))
                .toList();
    }

    public QuestionResponse get(Long questionId) {
        QuestionRecord question = findQuestion(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        return question.toResponse(handlerFor(question.type()), readDefinition(question), loadTags(question.id()));
    }

    @Transactional
    public QuestionAttemptResponse attempt(UserProfile user, Long questionId, SubmitQuestionAttemptRequest request) {
        QuestionRecord question = findQuestion(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        if (request.type() != question.type()) {
            QuestionValidation.badRequest("Submitted question type must match the stored question type.");
        }

        QuestionTypeHandler<Object, Object> handler = handlerFor(question.type());
        Object definition = readDefinition(question);
        Object submission = readJson(request.response(), handler.submissionClass(), "Question response is invalid.");
        handler.validateSubmission(definition, submission);
        ScoringResult scoring = handler.score(definition, submission);

        OffsetDateTime now = OffsetDateTime.now(clock);
        AttemptFeedback feedback = new AttemptFeedback(scoring.message(), question.explanation(), scoring.revealedSolution());
        StoredAttemptResult storedResult = new StoredAttemptResult(scoring.correct(), scoring.score(), scoring.maxScore(), feedback);
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update("""
                INSERT INTO question_attempts (
                    question_id, attempted_by_user_id, submission_json, result_json,
                    score, max_score, correct, attempted_at
                )
                VALUES (
                    :questionId, :attemptedByUserId, :submissionJson, :resultJson,
                    :score, :maxScore, :correct, :attemptedAt
                )
                """,
                new MapSqlParameterSource()
                        .addValue("questionId", question.id())
                        .addValue("attemptedByUserId", user.id())
                        .addValue("submissionJson", writeJson(submission))
                        .addValue("resultJson", writeJson(storedResult))
                        .addValue("score", scoring.score())
                        .addValue("maxScore", scoring.maxScore())
                        .addValue("correct", scoring.correct())
                        .addValue("attemptedAt", now),
                keyHolder,
                new String[] { "id" });

        return new QuestionAttemptResponse(
                keyHolder.getKey().longValue(),
                question.id(),
                scoring.correct(),
                scoring.score(),
                scoring.maxScore(),
                feedback,
                now);
    }

    public boolean allQuestionsExist(List<Long> questionIds) {
        Integer existingCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM questions
                WHERE id IN (:questionIds)
                """, new MapSqlParameterSource("questionIds", questionIds), Integer.class);
        return existingCount != null && existingCount == questionIds.size();
    }

    private Optional<QuestionRecord> findQuestion(Long questionId) {
        List<QuestionRecord> questions = jdbcTemplate.query("""
                SELECT id, created_by_user_id, type, prompt_text, prompt_media_json, definition_json,
                       explanation, difficulty, created_at
                FROM questions
                WHERE id = :questionId
                """, new MapSqlParameterSource("questionId", questionId), this::mapQuestion);
        return questions.stream().findFirst();
    }

    private QuestionRecord mapQuestion(java.sql.ResultSet rs, int rowNumber) throws java.sql.SQLException {
        return new QuestionRecord(
                rs.getLong("id"),
                rs.getLong("created_by_user_id"),
                QuestionType.valueOf(rs.getString("type")),
                new QuestionPrompt(
                        rs.getString("prompt_text"),
                        readStoredJson(rs.getString("prompt_media_json"), ContentBlock[].class)),
                rs.getString("definition_json"),
                rs.getString("explanation"),
                rs.getString("difficulty"),
                rs.getObject("created_at", OffsetDateTime.class));
    }

    private QuestionPrompt cleanPrompt(QuestionPrompt prompt) {
        QuestionPrompt cleanPrompt = prompt.cleaned();
        for (ContentBlock media : cleanPrompt.media()) {
            if (media == null || media.kind() == null) {
                QuestionValidation.badRequest("Prompt media kind is required.");
            }
            if (media.kind() != ContentKind.TEXT) {
                QuestionValidation.badRequest("Only text prompt media is supported for v1.");
            }
            QuestionValidation.requireCleanText(media.text(), "Prompt media text");
        }
        return cleanPrompt;
    }

    private List<String> cleanTags(List<String> tags) {
        if (tags == null) {
            return List.of();
        }
        List<String> cleanedTags = new ArrayList<>();
        for (String tag : tags) {
            String cleanTag = tag == null ? "" : tag.trim();
            if (cleanTag.isBlank()) {
                QuestionValidation.badRequest("Tags cannot be blank.");
            }
            if (cleanTag.length() > 80) {
                QuestionValidation.badRequest("Tags must be 80 characters or fewer.");
            }
            cleanedTags.add(cleanTag);
        }
        if (new LinkedHashSet<>(cleanedTags).size() != cleanedTags.size()) {
            QuestionValidation.badRequest("Tags must be unique.");
        }
        return List.copyOf(cleanedTags);
    }

    private String cleanOptional(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void insertTags(Long questionId, List<String> tags) {
        if (tags.isEmpty()) {
            return;
        }
        List<MapSqlParameterSource> rows = tags.stream()
                .map(tag -> new MapSqlParameterSource()
                        .addValue("questionId", questionId)
                        .addValue("tag", tag))
                .toList();
        jdbcTemplate.batchUpdate("""
                INSERT INTO question_tags (question_id, tag)
                VALUES (:questionId, :tag)
                """, rows.toArray(MapSqlParameterSource[]::new));
    }

    private List<String> loadTags(Long questionId) {
        return jdbcTemplate.queryForList("""
                SELECT tag
                FROM question_tags
                WHERE question_id = :questionId
                ORDER BY tag
                """, new MapSqlParameterSource("questionId", questionId), String.class);
    }

    private Map<Long, List<String>> loadTags(List<Long> questionIds) {
        if (questionIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<String>> tagsByQuestionId = new java.util.HashMap<>();
        jdbcTemplate.query("""
                SELECT question_id, tag
                FROM question_tags
                WHERE question_id IN (:questionIds)
                ORDER BY question_id, tag
                """, new MapSqlParameterSource("questionIds", questionIds), rs -> {
            tagsByQuestionId.computeIfAbsent(rs.getLong("question_id"), ignored -> new ArrayList<>()).add(rs.getString("tag"));
        });
        return tagsByQuestionId;
    }

    @SuppressWarnings("unchecked")
    private QuestionTypeHandler<Object, Object> handlerFor(QuestionType type) {
        QuestionTypeHandler<?, ?> handler = handlers.get(type);
        if (handler == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported question type.");
        }
        return (QuestionTypeHandler<Object, Object>) handler;
    }

    private Object readDefinition(QuestionRecord question) {
        return readJson(readStoredTree(question.definitionJson()), handlerFor(question.type()).definitionClass(), "Stored question definition is invalid.");
    }

    private <T> T readJson(JsonNode node, Class<T> type, String message) {
        try {
            return objectMapper.treeToValue(node, type);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private JsonNode readStoredTree(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Stored JSON could not be parsed.", ex);
        }
    }

    private List<ContentBlock> readStoredJson(String json, Class<ContentBlock[]> type) {
        try {
            ContentBlock[] values = objectMapper.readValue(json, type);
            return values == null ? List.of() : List.of(values);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Stored prompt media could not be parsed.", ex);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("JSON could not be written.", ex);
        }
    }

    private record QuestionRecord(
            Long id,
            Long createdByUserId,
            QuestionType type,
            QuestionPrompt prompt,
            String definitionJson,
            String explanation,
            String difficulty,
            OffsetDateTime createdAt) {
        QuestionResponse toResponse(QuestionTypeHandler<Object, Object> handler, Object definition, List<String> tags) {
            return new QuestionResponse(
                    id,
                    type,
                    prompt,
                    handler.toLearnerInteraction(definition),
                    difficulty,
                    List.copyOf(tags),
                    createdByUserId,
                    createdAt);
        }
    }

    private record StoredAttemptResult(
            boolean correct,
            java.math.BigDecimal score,
            java.math.BigDecimal maxScore,
            AttemptFeedback feedback) {
    }
}
