package com.wallet.clover.api.exception.handler

import com.wallet.clover.api.exception.CommentNotFoundException
import com.wallet.clover.api.exception.ForbiddenException
import com.wallet.clover.api.exception.PostNotFoundException
import com.wallet.clover.api.exception.TicketNotFoundException
import com.wallet.clover.api.exception.TicketParsingException
import com.wallet.clover.api.exception.UserNotFoundException
import org.slf4j.LoggerFactory
import com.wallet.clover.api.common.CommonResponse
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(ForbiddenException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleForbiddenException(e: ForbiddenException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "Forbidden")
    }

    @ExceptionHandler(UserNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleUserNotFoundException(e: UserNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "User not found")
    }

    @ExceptionHandler(PostNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handlePostNotFoundException(e: PostNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "Post not found")
    }

    @ExceptionHandler(CommentNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleCommentNotFoundException(e: CommentNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "Comment not found")
    }

    @ExceptionHandler(TicketNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleTicketNotFoundException(e: TicketNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "Ticket not found")
    }

    @ExceptionHandler(TicketParsingException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleTicketParsingException(e: TicketParsingException): CommonResponse<Unit> {
        logger.error("Ticket parsing failed", e)
        return CommonResponse.fail(e.message ?: "Failed to parse ticket")
    }

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleGlobalException(e: Exception): CommonResponse<Unit> {
        logger.error("Unexpected error occurred", e)
        return CommonResponse.fail("An unexpected error occurred")
    }
}
