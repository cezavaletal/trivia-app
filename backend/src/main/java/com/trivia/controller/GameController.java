package com.trivia.controller;

import com.trivia.dto.game.FinishGameResponse;
import com.trivia.dto.game.GameStateResponse;
import com.trivia.dto.game.StartGameRequest;
import com.trivia.dto.game.StartGameResponse;
import com.trivia.dto.game.SubmitAnswerRequest;
import com.trivia.dto.game.SubmitAnswerResponse;
import com.trivia.security.UserPrincipal;
import com.trivia.service.GameService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/games", "/api/partidas"})
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping
    public ResponseEntity<StartGameResponse> startGame(
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        @RequestBody(required = false) StartGameRequest request
    ) {
        StartGameResponse response = gameService.startGame(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameStateResponse> getGameState(
        @PathVariable("id") Long id,
        @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        GameStateResponse response = gameService.getGameState(id, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/answers")
    public ResponseEntity<SubmitAnswerResponse> submitAnswer(
        @PathVariable("id") Long id,
        @Valid @RequestBody SubmitAnswerRequest request,
        @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        SubmitAnswerResponse response = gameService.submitAnswer(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<FinishGameResponse> finishGame(
        @PathVariable("id") Long id,
        @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        FinishGameResponse response = gameService.finishGame(id, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }
}
