# Payment Web App

이 프로젝트는 페이먼트 웹 애플리케이션을 구현한 것입니다. 실시간 거래 내역 조회, 주/월별 집계 데이터 시각화, 실시간 알림 기능 등을 제공합니다.

- [데모 확인](https://payment-seonwoo-hans-projects.vercel.app/)

## 기술 스택

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

## 주요 기능

### 백엔드

1. 최신 거래 데이터 제공 API (api/transactions/recent)
2. 주간/월간 집계 데이터 제공 API (api/transactions/aggregate)
3. Server-Sent Events (SSE)를 통한 알림 기능

   SSE(Server-Sent Events)는 서버에서 클라이언트로 단방향 실시간 데이터 전송을 가능하게 하는 웹 기술입니다. 새로운 입출금 발생 시 서버에서 클라이언트로 알림을 보내기 위해서 사용했습니다.

### 프론트엔드

1. TanStack Query를 사용해서 데이터 페칭 및 캐싱
2. 실시간 데이터 업데이트 및 토스트 알림
   - 서버로부터 SSE를 통해 새 데이터 알림을 받으면 refetch를 수행
   - 단, SSE 연결에 실패한 경우 클라이언트에서 풀링을 통해 유사한 기능을 구현 (Local 환경에서는 작동하나, Vercel 배포 시 SSE 연결 실패하여 대안으로 구성했습니다.)
   - 실제로 새 데이터가 있는 경우 사용자에게 토스트 메시지로 알림
3. 차트 시각화
   - 주간/월간 데이터를 차트로 시각화
   - 동일 타임스탬프의 데이터에 대해 2개의 툴팁 표시
     (디자인에는 다른 시간대의 데이터에 툴팁에 표시되어 있으나, 유저가 그래프를 클릭했을 때 하나의 시간대만 선택할 수 있기에 변경했습니다.)

## 구현 상세

### 입출금 애니메이션 & 토스트메시지 효과

<img src="https://github.com/user-attachments/assets/4d60f008-886e-43ba-887a-da44eecd5811">

### 로딩 시 스켈레톤 효과 적용

<img src="https://github.com/user-attachments/assets/2a8416f2-677c-4416-85e7-8e398ffa04c1">

### 시간 계산 로직

UTC기준으로 저장된 mock data의 timestamp에서 시간 단위를 맞추기 위해서 계산하는 로직을 추가했습니다.

Local 환경과 배포된 환경에서 동일하게 작동하기 위함입니다.

```typescript
function getDateRange(period: AggregateType): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = toZonedTime(now, TIME_ZONE);

  const endDate = endOfDay(subDays(localTime, 1));
  let startDate: Date;
  if (period === "Week") {
    startDate = startOfDay(subDays(endDate, 6));
  } else if (period === "Month") {
    startDate = startOfDay(subMonths(endDate, 1));
  } else {
    throw new Error("Invalid period");
  }
  return {
    startDate: localTimeZone === "UTC" ? addHours(startDate, -9) : startDate,
    endDate: localTimeZone === "UTC" ? addHours(endDate, -9) : endDate,
  };
}
```

### 실시간 데이터 업데이트 로직

```typescript
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
