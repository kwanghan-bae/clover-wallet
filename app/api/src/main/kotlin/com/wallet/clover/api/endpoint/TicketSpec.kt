package com.wallet.clover.api.endpoint

import com.fasterxml.jackson.annotation.JsonUnwrapped
import com.wallet.clover.domain.game.LottoGame
import com.wallet.clover.domain.ticket.LottoTicket
import jakarta.validation.Constraint
import jakarta.validation.ConstraintValidator
import jakarta.validation.ConstraintValidatorContext
import jakarta.validation.Payload
import kotlin.reflect.KClass

interface TicketSpec {
    fun add(input: Add.In): Add.Out

    fun list(input: List.In): List.Out

    fun detail(ticketId: Long): Detail.Out

    object Detail {

        data class Out(
            @JsonUnwrapped
            val ticket: LottoTicket,
            val games: kotlin.collections.List<LottoGame>,
        )
    }

    object Add {
        data class In(
            @QrCode
            val qrCode: String,
            val userId: Long,
        )

        data class Out(
            val status: String,
            val message: String,
        ) {
            companion object {
                fun success() = Out(
                    status = "success",
                    message = "good",
                )
            }
        }

        object QrCodeValidator : ConstraintValidator<QrCode, String> {
            private const val PREFIX = "https://m.dhlottery.co.kr/qr.do?method=winQr&v="
            override fun isValid(value: String, context: ConstraintValidatorContext?): Boolean {
                return value.startsWith(PREFIX)
            }

        }

        @Target(AnnotationTarget.FIELD, AnnotationTarget.VALUE_PARAMETER)
        @Retention(AnnotationRetention.RUNTIME)
        @Constraint(validatedBy = [QrCodeValidator::class])
        annotation class QrCode(
            val message: String = "유효하지 않은 QR_CODE 입니다.",
            val groups: Array<KClass<Any>> = [],
            val payload: Array<KClass<out Payload>> = [],
        )
    }

    object List {
        data class In(
            val userId: Long,
        )

        data class Out(
            val tickets: kotlin.collections.List<LottoTicket>,
        )
    }
}
