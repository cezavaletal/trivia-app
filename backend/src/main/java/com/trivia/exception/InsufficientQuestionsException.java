package com.trivia.exception;

public class InsufficientQuestionsException extends RuntimeException {
    public InsufficientQuestionsException(String message) {
        super(message);
    }
}
