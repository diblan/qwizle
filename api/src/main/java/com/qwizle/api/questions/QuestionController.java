package com.qwizle.api.questions;

import java.util.List;

import com.qwizle.api.auth.AuthService;
import com.qwizle.api.auth.UserProfile;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    private final AuthService authService;
    private final QuestionService questionService;

    public QuestionController(AuthService authService, QuestionService questionService) {
        this.authService = authService;
        this.questionService = questionService;
    }

    @PostMapping
    public QuestionResponse create(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody CreateQuestionRequest request) {
        UserProfile user = authService.currentUser(authorizationHeader);
        return questionService.create(user, request);
    }

    @GetMapping
    public List<QuestionResponse> list(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        authService.currentUser(authorizationHeader);
        return questionService.list();
    }

    @GetMapping("/{questionId}")
    public QuestionResponse get(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @PathVariable Long questionId) {
        authService.currentUser(authorizationHeader);
        return questionService.get(questionId);
    }

    @PostMapping("/{questionId}/attempts")
    public QuestionAttemptResponse attempt(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @PathVariable Long questionId,
            @Valid @RequestBody SubmitQuestionAttemptRequest request) {
        UserProfile user = authService.currentUser(authorizationHeader);
        return questionService.attempt(user, questionId, request);
    }
}
