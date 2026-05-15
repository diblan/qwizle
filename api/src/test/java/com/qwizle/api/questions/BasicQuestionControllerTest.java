package com.qwizle.api.questions;

import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

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
class BasicQuestionControllerTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void loggedInUserCanCreateListAndAttemptBasicQuestion() throws Exception {
        String token = loginToken();

        String createdResponse = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateBasicQuestionRequest(
                                "  What is the capital of France?  ",
                                "  Paris  "))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.question").value("What is the capital of France?"))
                .andExpect(jsonPath("$.type").value("SINGLE_ANSWER"))
                .andExpect(jsonPath("$.solutionCount").value(1))
                .andExpect(jsonPath("$.createdByUserId").value(1))
                .andExpect(jsonPath("$.createdAt", not(emptyString())))
                .andExpect(jsonPath("$.answer").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        BasicQuestionResponse created = objectMapper.readValue(createdResponse, BasicQuestionResponse.class);

        mockMvc.perform(get("/api/questions")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id").value(created.id()))
                .andExpect(jsonPath("$[0].question").value("What is the capital of France?"))
                .andExpect(jsonPath("$[0].type").value("SINGLE_ANSWER"))
                .andExpect(jsonPath("$[0].solutionCount").value(1))
                .andExpect(jsonPath("$[0].answer").doesNotExist());

        mockMvc.perform(post("/api/questions/{questionId}/attempts", created.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AttemptBasicQuestionRequest("paris"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionId").value(created.id()))
                .andExpect(jsonPath("$.submittedAnswer").value("paris"))
                .andExpect(jsonPath("$.submittedAnswers", hasSize(0)))
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.attemptedAt", not(emptyString())));
    }


    @Test
    void loggedInUserCanCreateAndAttemptSetQuestionInAnyOrder() throws Exception {
        String token = loginToken();

        String createdResponse = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateBasicQuestionRequest(
                                "Name the layers of the OSI model.",
                                null,
                                QuestionType.SET_ANSWER,
                                List.of("Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.question").value("Name the layers of the OSI model."))
                .andExpect(jsonPath("$.type").value("SET_ANSWER"))
                .andExpect(jsonPath("$.solutionCount").value(7))
                .andExpect(jsonPath("$.answer").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        BasicQuestionResponse created = objectMapper.readValue(createdResponse, BasicQuestionResponse.class);

        mockMvc.perform(post("/api/questions/{questionId}/attempts", created.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AttemptBasicQuestionRequest(
                                null,
                                List.of("application", "presentation", "session", "transport", "network", "data link", "physical")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionId").value(created.id()))
                .andExpect(jsonPath("$.submittedAnswer").doesNotExist())
                .andExpect(jsonPath("$.submittedAnswers", hasSize(7)))
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.attemptedAt", not(emptyString())));
    }

    @Test
    void setQuestionAttemptRequiresConfiguredNumberOfAnswers() throws Exception {
        String token = loginToken();

        String createdResponse = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateBasicQuestionRequest(
                                "Name two primary colors.",
                                null,
                                QuestionType.SET_ANSWER,
                                List.of("Red", "Blue")))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        BasicQuestionResponse created = objectMapper.readValue(createdResponse, BasicQuestionResponse.class);

        mockMvc.perform(post("/api/questions/{questionId}/attempts", created.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AttemptBasicQuestionRequest(null, List.of("Red")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Submit exactly 2 answers."));
    }

    @Test
    void setQuestionCreationRejectsLineBreaksInsideAnswerElements() throws Exception {
        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + loginToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateBasicQuestionRequest(
                                "Name two primary colors.",
                                null,
                                QuestionType.SET_ANSWER,
                                List.of("Red\nBlue", "Yellow")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Set answers cannot contain line breaks."));
    }

    @Test
    void setQuestionAttemptRejectsLineBreaksInsideAnswerElements() throws Exception {
        String token = loginToken();

        String createdResponse = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateBasicQuestionRequest(
                                "Name two primary colors.",
                                null,
                                QuestionType.SET_ANSWER,
                                List.of("Red", "Blue")))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        BasicQuestionResponse created = objectMapper.readValue(createdResponse, BasicQuestionResponse.class);

        mockMvc.perform(post("/api/questions/{questionId}/attempts", created.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AttemptBasicQuestionRequest(null, List.of("Red\r\nBlue", "Yellow")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Set answers cannot contain line breaks."));
    }

    @Test
    void questionEndpointsRejectMissingBearerToken() throws Exception {
        mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateBasicQuestionRequest("Question?", "Answer"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));

        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));

        mockMvc.perform(post("/api/questions/1/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AttemptBasicQuestionRequest("Answer"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));
    }

    @Test
    void createQuestionRejectsBlankQuestion() throws Exception {
        mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + loginToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateBasicQuestionRequest(" ", "Answer"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Question is required."));
    }

    @Test
    void attemptingMissingQuestionReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/questions/999999/attempts")
                        .header("Authorization", "Bearer " + loginToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AttemptBasicQuestionRequest("Answer"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Question not found."));
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
