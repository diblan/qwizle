package com.qwizle.api.questions;

import java.util.List;

import com.qwizle.api.auth.AuthService;
import com.qwizle.api.auth.UserProfile;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    private final AuthService authService;
    private final QuizService quizService;

    public QuizController(AuthService authService, QuizService quizService) {
        this.authService = authService;
        this.quizService = quizService;
    }

    @PostMapping
    public QuizResponse create(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @Valid @RequestBody CreateQuizRequest request) {
        UserProfile user = authService.currentUser(authorizationHeader);
        return quizService.create(user, request);
    }

    @GetMapping
    public List<QuizResponse> list(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        authService.currentUser(authorizationHeader);
        return quizService.list();
    }
}
