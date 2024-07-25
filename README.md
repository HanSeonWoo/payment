# Payment Web App

이 프로젝트는 페이먼트 웹 애플리케이션을 구현한 것입니다. 실시간 거래 내역 조회, 주/월별 집계 데이터 시각화, 실시간 알림 기능 등을 제공합니다.

## 기술 스택

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

## 주요 기능

### 백엔드

1. 최신 거래 데이터 제공 API
2. 주간/월간 집계 데이터 제공 API
3. Server-Sent Events (SSE)를 통한 실시간 알림 기능

   SSE(Server-Sent Events)는 서버에서 클라이언트로 단방향 실시간 데이터 전송을 가능하게 하는 웹 기술입니다. 새로운 입출금 발생 시 서버에서 클라이언트로 즉시 알림을 보낼 수 있어, 실시간 업데이트에 적합합니다.

### 프론트엔드

1. TanStack Query를 사용한 효율적인 데이터 페칭 및 캐싱
2. 실시간 데이터 업데이트 및 토스트 알림
   - 서버로부터 SSE를 통해 새 데이터 알림을 받으면 refetch를 수행
   - 실제로 새 데이터가 있는 경우 사용자에게 토스트 메시지로 알림
3. 차트 시각화
   - 주간/월간 데이터를 차트로 시각화
   - 동일 타임스탬프의 데이터에 대해 다중 툴팁 표시 기능 구현

## 구현 상세

### 실시간 데이터 업데이트 로직

```javascript
useEffect(() => {
  if (data && previousDataRef.current) {
    const typeChanged = previousTypeRef.current !== transactionType;

    if (!typeChanged) {
      const hasNewData = data.some(
        (newItem) =>
          !previousDataRef.current!.some(
            (oldItem) =>
              oldItem.timestamp === newItem.timestamp &&
              oldItem.name === newItem.name,
          ),
      );

      if (hasNewData) {
        toast({
          title: "새로운 입출금 내역이 있습니다!",
        });
      }
    }
  }
  previousDataRef.current = data || null;
  previousTypeRef.current = transactionType;
}, [data, toast, transactionType]);
```

이 로직은 새로운 데이터가 있을 때만 토스트 알림을 표시하며, 트랜잭션 타입 변경 시에는 알림을 표시하지 않습니다.

### 차트 툴팁 구현

동일한 타임스탬프를 가진 데이터 포인트에 대해 다중 툴팁을 표시하도록 구현하여, 사용자가 한 번에 여러 데이터 시리즈의 정보를 볼 수 있도록 했습니다.

## 설치 및 실행

(이 부분에 프로젝트 설치 및 실행 방법을 추가해주세요)

## 기여

이 프로젝트에 기여하고 싶으신 분들은 Pull Request를 보내주시기 바랍니다. 큰 변경사항의 경우, 먼저 이슈를 열어 논의해주세요.

## 라이선스

(프로젝트의 라이선스 정보를 추가해주세요)
