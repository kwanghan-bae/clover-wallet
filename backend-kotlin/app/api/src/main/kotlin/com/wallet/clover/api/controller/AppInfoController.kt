package com.wallet.clover.api.controller

import com.wallet.clover.api.common.CommonResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/app")
class AppInfoController {

    companion object {
        private const val CURRENT_VERSION = "1.0.0"
        private const val MIN_SUPPORTED_VERSION = "1.0.0"
    }

    @GetMapping("/version")
    fun checkVersion(@RequestParam currentVersion: String): CommonResponse<Map<String, Any>> {
        val needsUpdate = compareVersions(currentVersion, MIN_SUPPORTED_VERSION) < 0
        val hasUpdate = compareVersions(currentVersion, CURRENT_VERSION) < 0
        
        val info = mapOf(
            "currentVersion" to CURRENT_VERSION,
            "minSupportedVersion" to MIN_SUPPORTED_VERSION,
            "needsUpdate" to needsUpdate,  // 필수 업데이트
            "hasUpdate" to hasUpdate,      // 선택적 업데이트
            "updateMessage" to if (needsUpdate) 
                "이 버전은 더 이상 지원되지 않습니다. 업데이트가 필요합니다." 
            else if (hasUpdate)
                "새로운 버전이 출시되었습니다. 업데이트를 권장합니다."
            else
                "최신 버전을 사용 중입니다."
        )
        
        return CommonResponse.success(info)
    }
    
    private fun compareVersions(v1: String, v2: String): Int {
        val parts1 = v1.split(".").map { it.toIntOrNull() ?: 0 }
        val parts2 = v2.split(".").map { it.toIntOrNull() ?: 0 }
        
        for (i in 0 until maxOf(parts1.size, parts2.size)) {
            val p1 = parts1.getOrNull(i) ?: 0
            val p2 = parts2.getOrNull(i) ?: 0
            if (p1 != p2) return p1.compareTo(p2)
        }
        return 0
    }
}
