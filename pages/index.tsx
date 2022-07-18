import { Box, Button, Text, Table, Tbody, Td, Th, Thead, Tr, useBoolean, Flex } from '@chakra-ui/react'
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import request, { gql } from 'graphql-request'
import Head from 'next/head'

interface Live {
  id: string
  title: string
  startDate: string
  isCanceled: boolean | null
}

interface ComputedLive extends Live {
  startDateObject: Date
  isCompleted: boolean
}

const title = '밴드 이디어츠의 공연 기록'
const description = '이디어츠는 지금까지 몇번의 공연을 했을까요?'
const imageUrl = 'https://live.idiots.band/bg.jpeg'
const Home: NextPage = ({ liveList }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [visibleLiveList, setVisibleLiveList] = useBoolean(false)
  const completedLiveCount = liveList.filter((live: Live) => new Date(live.startDate) <= new Date()).length

  const computedLiveList: ComputedLive[] = liveList.map((live: Live) => ({
    ...live,
    startDateObject: new Date(live.startDate),
    isCompleted: new Date(live.startDate) <= new Date(),
  }))

  return (
    <>
      <Flex
        zIndex="-1"
        position="fixed"
        top="0"
        bottom="0"
        left="0"
        right="0"
        alignItems="center"
        backgroundImage="url(/bg.jpeg)"
        backgroundSize="cover"
        backgroundPosition="center"
        filter="blur(5px)"
      />
      <Flex
        h={visibleLiveList ? 'auto' : '100vh'}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        padding="24px"
        color="white"
      >
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:image" content={imageUrl} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="winterwolf0412" />
          <meta name="twitter:title" content={title} />
        </Head>
        <Box fontSize="2xl" bgColor="blackAlpha.600" padding="16px" borderRadius="16px" marginBottom="16px">
          이디어츠는 지금까지{' '}
          <Text display="inline" fontWeight="bold">
            {completedLiveCount}
          </Text>
          번의 공연을 했습니다.
        </Box>
        <Box overflowY={visibleLiveList ? 'scroll' : 'auto'} h={visibleLiveList ? 'calc(100vh - 240px)' : 0}>
          {visibleLiveList && (
            <Table bgColor="blackAlpha.600" variant="simple" fontSize={['xs', null, 'sm', 'md']}>
              <Thead>
                <Tr>
                  <Th w="70px" color="white">
                    횟수
                  </Th>
                  <Th w="150px" color="white">
                    공연일
                  </Th>
                  <Th color="white">공연명</Th>
                </Tr>
              </Thead>
              <Tbody>
                {computedLiveList.map((live: ComputedLive, i: number) => (
                  <Tr
                    key={live.id}
                    bgColor={live.isCompleted ? '' : 'blackAlpha.800'}
                    _hover={{
                      cursor: 'pointer',
                      backgroundColor: 'blackAlpha.400',
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                    onClick={() => {
                      window.open(`https://indistreet.com/live/${live.id}`, '_blank')
                    }}
                  >
                    <Td>{liveList.length - i}</Td>
                    <Td>{new Date(live.startDate).toLocaleDateString()}</Td>
                    <Td>
                      <Flex alignContent="center" justifyContent="space-between">
                        <Box
                          as="a"
                          alignSelf="center"
                          href={`https://indistreet.com/live/${live.id}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {live.title}
                        </Box>
                        <Box
                          as="a"
                          alignSelf="center"
                          href={`https://indistreet.com/live/${live.id}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Button bgColor="blackAlpha.600">자세히 보기</Button>
                        </Box>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
        <Button marginTop="8px" colorScheme="blue" onClick={setVisibleLiveList.toggle}>
          <Box>{visibleLiveList ? '숨기기' : '공연내역 보기'}</Box>
        </Button>
      </Flex>
    </>
  )
}

export default Home

export const getStaticProps: GetStaticProps = async () => {
  const res = await request<{
    lives: Live[]
  }>(
    'https://indistreet.graphcdn.app/graphql',
    gql`
      query findLiveByMusicianId {
        lives(where: { musicians: { id: "1" } }, sort: "startDate:DESC") {
          id
          title
          startDate
          isCanceled
        }
      }
    `
  )

  return {
    props: {
      // Note: isCanceled가 null인 경우가 있어서 true로 필터하면 제대로 못 가져옴.
      // 데이터 업데이트 하면 되긴 하는데 귀찮아서 그냥 클라이언트에서 필터링
      liveList: res.lives.filter(live => !live.isCanceled),
    },
    revalidate: 60 * 50,
  }
}
