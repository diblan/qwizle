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
public class BasicQuestionController {
    private final AuthService authService;
    private final BasicQuestionService questionService;

    public BasicQuestionController(AuthService authService, BasicQuestionService questionService) {
        this.authService = authService;
        this.questionService = questionService;
    }

    @PostMapping
    public BasicQuestionResponse create(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody CreateBasicQuestionRequest request) {
        UserProfile user = authService.currentUser(authorizationHeader);
        return questionService.create(user, request);
    }

    @GetMapping
    public List<BasicQuestionResponse> list(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        authService.currentUser(authorizationHeader);
        return questionService.list();
    }

    @PostMapping("/{questionId}/attempts")
    public BasicQuestionAttemptResponse attempt(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @PathVariable Long questionId,
            @Valid @RequestBody AttemptBasicQuestionRequest request) {
        UserProfile user = authService.currentUser(authorizationHeader);
        return questionService.attempt(user, questionId, request);
    }
}
