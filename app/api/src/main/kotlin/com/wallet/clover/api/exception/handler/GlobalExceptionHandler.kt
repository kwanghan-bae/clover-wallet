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
        return CommonResponse.fail(e.message ?: "접근 권한이 없습니다")
    }

    @ExceptionHandler(UserNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleUserNotFoundException(e: UserNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "사용자를 찾을 수 없습니다")
    }

    @ExceptionHandler(PostNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handlePostNotFoundException(e: PostNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "게시글을 찾을 수 없습니다")
    }

    @ExceptionHandler(CommentNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleCommentNotFoundException(e: CommentNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "댓글을 찾을 수 없습니다")
    }

    @ExceptionHandler(TicketNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleTicketNotFoundException(e: TicketNotFoundException): CommonResponse<Unit> {
        return CommonResponse.fail(e.message ?: "티켓을 찾을 수 없습니다")
    }

    @ExceptionHandler(TicketParsingException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleTicketParsingException(e: TicketParsingException): CommonResponse<Unit> {
        logger.error("티켓 파싱 실패", e)
        return CommonResponse.fail(e.message ?: "티켓 파싱에 실패했습니다")
    }

    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleIllegalArgumentException(e: IllegalArgumentException): CommonResponse<Unit> {
        logger.warn("잘못된 요청 인자: ${e.message}")
        return CommonResponse.fail(e.message ?: "잘못된 요청입니다")
    }

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleGlobalException(e: Exception): CommonResponse<Unit> {
        logger.error("예기치 않은 오류 발생", e)
        return CommonResponse.fail("예기치 않은 오류가 발생했습니다")
    }
}
