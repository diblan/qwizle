package com.qwizle.api.questions;

import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
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
class QuizControllerTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void loggedInUserCanCreateAndListQuizFromExistingQuestions() throws Exception {
        String token = loginToken();
        BasicQuestionResponse tcpQuestion = createQuestion(token, new CreateBasicQuestionRequest(
                "In what layer of the OSI model resides TCP?",
                "4"));
        BasicQuestionResponse layerQuestion = createQuestion(token, new CreateBasicQuestionRequest(
                "Give me all layers of the OSI model.",
                null,
                QuestionType.SET_ANSWER,
                List.of("Physical", "Data Link", "Network", "Transport", "Session", "Presentation", "Application")));

        String createdResponse = mockMvc.perform(post("/api/quizzes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateQuizRequest(
                                "  OSI model basics  ",
                                "  Learn TCP placement and all seven layers.  ",
                                List.of(tcpQuestion.id(), layerQuestion.id())))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("OSI model basics"))
                .andExpect(jsonPath("$.description").value("Learn TCP placement and all seven layers."))
                .andExpect(jsonPath("$.questionCount").value(2))
                .andExpect(jsonPath("$.createdByUserId").value(1))
                .andExpect(jsonPath("$.createdAt", not(emptyString())))
                .andExpect(jsonPath("$.questions", hasSize(2)))
                .andExpect(jsonPath("$.questions[0].id").value(tcpQuestion.id()))
                .andExpect(jsonPath("$.questions[0].answer").doesNotExist())
                .andExpect(jsonPath("$.questions[1].id").value(layerQuestion.id()))
                .andExpect(jsonPath("$.questions[1].type").value("SET_ANSWER"))
                .andExpect(jsonPath("$.questions[1].solutionCount").value(7))
                .andReturn()
                .getResponse()
                .getContentAsString();

        QuizResponse created = objectMapper.readValue(createdResponse, QuizResponse.class);

        mockMvc.perform(get("/api/quizzes")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(created.id()))
                .andExpect(jsonPath("$[0].title").value("OSI model basics"))
                .andExpect(jsonPath("$[0].questionCount").value(2))
                .andExpect(jsonPath("$[0].questions[0].question").value("In what layer of the OSI model resides TCP?"))
                .andExpect(jsonPath("$[0].questions[1].question").value("Give me all layers of the OSI model."));
    }

    @Test
    void createQuizRejectsTooFewQuestions() throws Exception {
        String token = loginToken();
        BasicQuestionResponse question = createQuestion(token, new CreateBasicQuestionRequest("Question?", "Answer"));

        mockMvc.perform(post("/api/quizzes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateQuizRequest(
                                "Tiny quiz",
                                null,
                                List.of(question.id())))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Choose at least two questions for the quiz."));
    }

    @Test
    void createQuizRejectsNullQuestionIds() throws Exception {
        String token = loginToken();
        BasicQuestionResponse firstQuestion = createQuestion(token,
                new CreateBasicQuestionRequest("First question?", "Answer"));
        BasicQuestionResponse secondQuestion = createQuestion(token,
                new CreateBasicQuestionRequest("Second question?", "Answer"));

        mockMvc.perform(post("/api/quizzes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateQuizRequest(
                                "Malformed quiz",
                                null,
                                Arrays.asList(firstQuestion.id(), null, secondQuestion.id())))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Quiz question IDs are required."));
    }

    @Test
    void createQuizRejectsDuplicateQuestionIds() throws Exception {
        String token = loginToken();
        BasicQuestionResponse question = createQuestion(token, new CreateBasicQuestionRequest("Question?", "Answer"));

        mockMvc.perform(post("/api/quizzes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateQuizRequest(
                                "Duplicate quiz",
                                null,
                                List.of(question.id(), question.id())))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Quiz questions must be unique."));
    }

    @Test
    void createQuizRejectsMissingQuestionIds() throws Exception {
        mockMvc.perform(post("/api/quizzes")
                        .header("Authorization", "Bearer " + loginToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateQuizRequest(
                                "Missing question quiz",
                                null,
                                List.of(123456L, 987654L)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Questions must exist before they can be added to a quiz."));
    }

    @Test
    void quizEndpointsRejectMissingBearerToken() throws Exception {
        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateQuizRequest("Quiz", null, List.of(1L, 2L)))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));

        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing bearer token."));
    }

    private BasicQuestionResponse createQuestion(String token, CreateBasicQuestionRequest request) throws Exception {
        String response = mockMvc.perform(post("/api/questions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readValue(response, BasicQuestionResponse.class);
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
