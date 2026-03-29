import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { AlertTriangle, RefreshCcw } from 'lucide-react-native';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * @description 애플리케이션 전체의 예기치 못한 오류를 포착하여 에러 화면을 표시하는 컴포넌트입니다.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  /** @description 자식 컴포넌트에서 에러 발생 시 상태를 업데이트하여 에러 UI를 렌더링하도록 합니다. */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /** @description 에러 정보를 로깅하거나 외부 서비스로 전송할 때 사용합니다. */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  /** @description 에러 상태를 초기화하고 자식 컴포넌트 재렌더링을 시도합니다. */
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white justify-center items-center px-10">
          <View className="bg-red-50 p-6 rounded-full mb-6">
            <AlertTriangle size={48} color="#EF5350" />
          </View>
          <Text className="text-xl font-bold text-[#1A1A1A] mb-2">문제가 발생했습니다</Text>
          <Text className="text-gray-500 text-center mb-10 leading-5">
            앱 실행 중 예기치 못한 오류가 발생했습니다.
            지속될 경우 관리자에게 문의해주세요.
          </Text>
          
          <TouchableOpacity 
            onPress={this.handleReset}
            className="bg-primary px-8 py-4 rounded-full flex-row items-center shadow-lg"
          >
            <RefreshCcw size={20} color="white" />
            <Text className="text-white font-bold ml-2">다시 시도하기</Text>
          </TouchableOpacity>

          <Text className="text-gray-300 text-[10px] mt-20">
            Error: {this.state.error?.message}
          </Text>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
