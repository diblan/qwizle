package com.qwizle.api.questions;

import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qwizle.api.auth.LoginRequest;
import com.qwizle.api.auth.LoginResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QuestionControllerTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void loggedInUserCanCreateListGetAndAttemptSingleAnswerQuestion() throws Exception {
        String token = loginToken();
        Long questionId = createQuestion(token, singleAnswerQuestion()).id();

        mockMvc.perform(get("/api/questions/{questionId}", questionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(questionId))
                .andExpect(jsonPath("$.type").value("SINGLE_ANSWER"))
                .andExpect(jsonPath("$.prompt.text").value("What does HTTP stand for?"))
                .andExpect(jsonPath("$.interaction.kind").value("TEXT"))
                .andExpect(jsonPath("$.definition").doesNotExist())
                .andExpect(jsonPath("$.answer").doesNotExist());

        mockMvc.perform(get("/api/questions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(questionId))
                .andExpect(jsonPath("$[0].createdAt", not(emptyString())));

        mockMvc.perform(post("/api/questions/{questionId}/attempts", questionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "SINGLE_ANSWER",
                                "response", Map.of("text", "hypertext transfer protocol")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attemptId").exists())
                .andExpect(jsonPath("$.questionId").value(questionId))
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.score").value(1))
                .andExpect(jsonPath("$.maxScore").value(1))
                .andExpect(jsonPath("$.feedback.revealedSolution.type").value("SINGLE_ANSWER"))
                .andExpect(jsonPath("$.attemptedAt", not(emptyString())));
    }

    @Test
    void singleAnswerQuestionRejectsMissingAcceptedAnswers() throws Exception {
        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + loginToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "SINGLE_ANSWER",
                                "prompt", Map.of("text", "Question?"),
                                "definition", Map.of("acceptedAnswers", List.of())))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Accepted answers are required."));
    }

    @Test
    void multipleAnswerRequiredSetCanBeAttemptedInAnyOrder() throws Exception {
        String token = loginToken();
        Long questionId = createQuestion(token, multipleAnswerQuestion()).id();

        mockMvc.perform(post("/api/questions/{questionId}/attempts", questionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "MULTIPLE_ANSWER",
                                "response", Map.of("answers", List.of(
                                        "application", "presentation", "session", "transport", "network", "data link", "physical"))))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.feedback.revealedSolution.mode").value("REQUIRED_SET"));
    }

    @Test
    void multipleAnswerAttemptRequiresConfiguredNumberOfAnswers() throws Exception {
        String token = loginToken();
        Long questionId = createQuestion(token, multipleAnswerQuestion()).id();

        mockMvc.perform(post("/api/questions/{questionId}/attempts", questionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "MULTIPLE_ANSWER",
                                "response", Map.of("answers", List.of("Physical"))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Submit exactly 7 answers."));
    }

    @Test
    void multipleChoiceSupportsMultipleCorrectOptions() throws Exception {
        String token = loginToken();
        Long questionId = createQuestion(token, multipleChoiceQuestion("MULTIPLE", List.of("tcp", "udp"))).id();

        mockMvc.perform(post("/api/questions/{questionId}/attempts", questionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "MULTIPLE_CHOICE",
                                "response", Map.of("selectedOptionIds", List.of("tcp", "udp"))))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.feedback.revealedSolution.correctOptionIds", hasSize(2)));
    }

    @Test
    void multipleChoiceRejectsSingleChoiceWithMultipleCorrectOptions() throws Exception {
        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + loginToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(multipleChoiceQuestion("SINGLE", List.of("tcp", "udp")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Single-choice questions require exactly one correct option."));
    }

    @Test
    void matchQuestionScoresCorrectPairs() throws Exception {
        String token = loginToken();
        Long questionId = createQuestion(token, matchQuestion()).id();

        mockMvc.perform(post("/api/questions/{questionId}/attempts", questionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "MATCH",
                                "response", Map.of("pairs", List.of(
                                        Map.of("leftId", "http", "rightId", "port-80"),
                                        Map.of("leftId", "https", "rightId", "port-443")))))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.feedback.revealedSolution.pairs", hasSize(2)));
    }

    @Test
    void matchQuestionRejectsUnknownPairIds() throws Exception {
        String token = loginToken();
        Long questionId = createQuestion(token, matchQuestion()).id();

        mockMvc.perform(post("/api/questions/{questionId}/attempts", questionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "MATCH",
                                "response", Map.of("pairs", List.of(
                                        Map.of("leftId", "http", "rightId", "port-999"),
                                        Map.of("leftId", "https", "rightId", "port-443")))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Match pair IDs must belong to the question."));
    }

    @Test
    void attemptRejectsMismatchedQuestionType() throws Exception {
        String token = loginToken();
        Long questionId = createQuestion(token, singleAnswerQuestion()).id();

        mockMvc.perform(post("/api/questions/{questionId}/attempts", questionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "MULTIPLE_CHOICE",
                                "response", Map.of("selectedOptionIds", List.of("tcp"))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Submitted question type must match the stored question type."));
    }

    @Test
    void questionEndpointsRejectMissingBearerToken() throws Exception {
        mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(singleAnswerQuestion())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));

        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));

        mockMvc.perform(post("/api/questions/1/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "SINGLE_ANSWER",
                                "response", Map.of("text", "Answer")))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));
    }

    @Test
    void attemptingMissingQuestionReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/questions/999999/attempts")
                        .header("Authorization", "Bearer " + loginToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "type", "SINGLE_ANSWER",
                                "response", Map.of("text", "Answer")))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Question not found."));
    }

    private QuestionResponse createQuestion(String token, Map<String, Object> request) throws Exception {
        String response = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readValue(response, QuestionResponse.class);
    }

    private Map<String, Object> singleAnswerQuestion() {
        return Map.of(
                "type", "SINGLE_ANSWER",
                "prompt", Map.of("text", "What does HTTP stand for?"),
                "definition", Map.of(
                        "acceptedAnswers", List.of(
                                Map.of("text", "Hypertext Transfer Protocol"),
                                Map.of("text", "Hyper Text Transfer Protocol"))),
                "explanation", "HTTP is the application-layer protocol used by the web.",
                "difficulty", "BEGINNER",
                "tags", List.of("web"));
    }

    private Map<String, Object> multipleAnswerQuestion() {
        return Map.of(
                "type", "MULTIPLE_ANSWER",
                "prompt", Map.of("text", "Name all layers of the OSI model."),
                "definition", Map.of(
                        "mode", "REQUIRED_SET",
                        "answers", List.of(
                                Map.of("id", "physical", "text", "Physical"),
                                Map.of("id", "data-link", "text", "Data Link"),
                                Map.of("id", "network", "text", "Network"),
                                Map.of("id", "transport", "text", "Transport"),
                                Map.of("id", "session", "text", "Session"),
                                Map.of("id", "presentation", "text", "Presentation"),
                                Map.of("id", "application", "text", "Application"))));
    }

    private Map<String, Object> multipleChoiceQuestion(String selectionMode, List<String> correctOptionIds) {
        return Map.of(
                "type", "MULTIPLE_CHOICE",
                "prompt", Map.of("text", "Which are transport-layer protocols?"),
                "definition", Map.of(
                        "selectionMode", selectionMode,
                        "options", List.of(
                                Map.of("id", "tcp", "content", Map.of("kind", "TEXT", "text", "TCP")),
                                Map.of("id", "udp", "content", Map.of("kind", "TEXT", "text", "UDP")),
                                Map.of("id", "http", "content", Map.of("kind", "TEXT", "text", "HTTP"))),
                        "correctOptionIds", correctOptionIds));
    }

    private Map<String, Object> matchQuestion() {
        return Map.of(
                "type", "MATCH",
                "prompt", Map.of("text", "Match protocols to default ports."),
                "definition", Map.of(
                        "leftItems", List.of(
                                Map.of("id", "http", "content", Map.of("kind", "TEXT", "text", "HTTP")),
                                Map.of("id", "https", "content", Map.of("kind", "TEXT", "text", "HTTPS"))),
                        "rightItems", List.of(
                                Map.of("id", "port-80", "content", Map.of("kind", "TEXT", "text", "80")),
                                Map.of("id", "port-443", "content", Map.of("kind", "TEXT", "text", "443"))),
                        "pairs", List.of(
                                Map.of("leftId", "http", "rightId", "port-80"),
                                Map.of("leftId", "https", "rightId", "port-443"))));
    }

    private String loginToken() throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("learner@qwizle.test", "qwizle123"))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readValue(response, LoginResponse.class).token();
    }
}
