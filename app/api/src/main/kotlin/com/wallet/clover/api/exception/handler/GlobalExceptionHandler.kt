package com.wallet.clover.api.exception.handler

import com.wallet.clover.api.exception.CommentNotFoundException
import com.wallet.clover.api.exception.PostNotFoundException
import com.wallet.clover.api.exception.TicketNotFoundException
import com.wallet.clover.api.exception.UserNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFoundException(e: UserNotFoundException): ProblemDetail {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message ?: "User not found")
    }

    @ExceptionHandler(PostNotFoundException::class)
    fun handlePostNotFoundException(e: PostNotFoundException): ProblemDetail {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message ?: "Post not found")
    }

    @ExceptionHandler(CommentNotFoundException::class)
    fun handleCommentNotFoundException(e: CommentNotFoundException): ProblemDetail {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message ?: "Comment not found")
    }

    @ExceptionHandler(TicketNotFoundException::class)
    fun handleTicketNotFoundException(e: TicketNotFoundException): ProblemDetail {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.message ?: "Ticket not found")
    }

    @ExceptionHandler(Exception::class)
    fun handleGlobalException(e: Exception): ProblemDetail {
        logger.error("Unexpected error occurred", e)
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred")
    }
}
