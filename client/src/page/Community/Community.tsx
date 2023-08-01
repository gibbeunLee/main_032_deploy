import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { useState } from 'react';

import PostsCard, {
  PostCommunityInterface,
} from '../../components/Community/PostsCard';
import SearchBar from '../../components/Community/SearchBar';
import WriteButton from '../../components/Community/WriteButton';
import { getCommunityList } from '../../api/service';

export interface CommunityDataInterface {
  data: PostCommunityInterface[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentKeyword, setCurrentKeyword] = useState('');
  const menus = [
    { name: '전체', key: '' },
    { name: '당일치기', key: 'DAYTRIP' },
    { name: '여행', key: 'TRAVEL' },
    { name: '일상', key: 'DAILY' },
    { name: '회사', key: 'COMPANY' },
  ];

  const category = searchParams.get('category');

  const { fetchNextPage, refetch, hasNextPage, isFetchingNextPage, data } =
    useInfiniteQuery(
      ['getCommunityList', currentKeyword, category],
      ({ pageParam }: { pageParam?: number }) => {
        const pageNum = pageParam ? pageParam + 1 : 1;
        return getCommunityList({
          page: pageNum,
          search: currentKeyword,
          category: category || undefined,
        });
      },
      {
        getNextPageParam: (lastPage: CommunityDataInterface) => {
          if (!lastPage) {
            return undefined;
          }
          return lastPage.pageInfo.page === lastPage.pageInfo.totalPages
            ? undefined
            : lastPage.pageInfo.page;
        },
      },
    );

  let currentData: PostCommunityInterface[] = [];
  if (data && data.pages) {
    data.pages.forEach((page: CommunityDataInterface) => {
      currentData = currentData.concat(page.data);
    });
  } else if (data && Array.isArray(data)) {
    currentData = data.slice();
  }

  return (
    <CommunityContainer>
      <UpperBar>
        <ButtonGroup>
          {menus.map((obj, i) => {
            return (
              <>
                <StyledButton
                  isCurrent={
                    (category === obj.key && !!category) ||
                    (i === 0 && !category)
                  }
                  onClick={() => {
                    if (i === 0) {
                      setSearchParams();
                    } else {
                      setSearchParams({ category: obj.key });
                    }
                  }}
                  key={obj.key}
                >
                  {obj.name}
                </StyledButton>
                <StyledDivider />
              </>
            );
          })}
        </ButtonGroup>
        <RightContainer>
          <SearchBar
            refetchSearch={refetch}
            currentKeyword={currentKeyword}
            setCurrentKeyword={setCurrentKeyword}
          />
          <WriteButton />
        </RightContainer>
      </UpperBar>

      <PostsContainer>
        {currentData.map((post: PostCommunityInterface) => (
          <PostsCard post={post} key={post.communityId} />
        ))}
        <MoreButton
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? '가져오는 중...'
            : hasNextPage
            ? '더보기'
            : '끝!'}
        </MoreButton>
      </PostsContainer>
    </CommunityContainer>
  );
}

export default Community;

const CommunityContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  margin-top: 67px;
  padding: 16px;
  overflow: auto;
  background-color: #f9f9f9;
`;

const ButtonGroup = styled.div`
  border-radius: 7px;
  background-color: white;
  display: flex;
  align-items: center;
`;

const StyledButton = styled.button<{ isCurrent: boolean }>`
  color: ${({ isCurrent }) => (isCurrent ? '#98DDE3' : '#787878')};
  background-color: transparent;
  border: none;
  padding: 12px 16px;
  font-size: 20px;
  @media screen and (max-width: 600px) {
    font-size: 16px;
    padding: 12px 14px;
  }
`;

const StyledDivider = styled.div`
  width: 1px;
  height: 15px;
  background-color: #98dde3;
  &:last-child {
    display: none;
  }
`;

const UpperBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  max-width: 900px;
  width: 100%;
  margin-top: 54px;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  @media screen and (max-width: 850px) {
    margin-top: 20px;
  }
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 900px;
  width: 100%;
  margin-top: 28px;
  gap: 16px;
`;

const MoreButton = styled.button``;
