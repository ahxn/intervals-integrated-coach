import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useWorkouts(date?: string) {
  const queryParams = date ? `?date=${date}` : ''
  const { data, error, isLoading, mutate } = useSWR(
    `/api/workouts/today${queryParams}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    workout: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function usePlan() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/plans/current',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    plan: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useFeedback() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/feedback',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    feedbacks: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
