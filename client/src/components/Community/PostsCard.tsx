import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import commentIcon from '../../assets/commentIcon.png';
import likeIcon from '../../assets/likeIcon.png';

export interface PostCommunityInterface {
  communityId: number;
  userInfo: {
    nickName: string;
  };
  title: string;
  body: string;
  category: string;
  liked: number;
  views: number;
  createdAt: string;
}

function PostsCard({ post }: { post: PostCommunityInterface }) {
  const date = format(new Date(post.createdAt), 'yyyy.MM.dd');

  return (
    <PostsCardContainer to={`/community/detail/${post.communityId}`}>
      <TopContainer>
        <Nickname>{post.userInfo.nickName}</Nickname>
        <CategoryBox>
          <CategoryBadge
            style={{ backgroundColor: getCategoryColor(post.category) }}
          />
          {post.category}
        </CategoryBox>
      </TopContainer>
      <Title>{post.title}</Title>
      <Content>{post.body}</Content>
      <BottomContainer>
        <ButtonsContainer>
          <LikesContainer>
            <Icon src={likeIcon}></Icon>
            {post.liked}
          </LikesContainer>
          <CommentsContainer>
            <Icon src={commentIcon}></Icon>
            {post.views}
          </CommentsContainer>
        </ButtonsContainer>
        <DateWrapper>{date}</DateWrapper>
      </BottomContainer>
    </PostsCardContainer>
  );
}

export default PostsCard;

const PostsCardContainer = styled(Link)`
  display: flex;
  flex-direction: column;
  max-width: 900px;
  padding: 16px 24px;
  gap: 8px;
  font-size: 14px;
  color: inherit;
  text-decoration: none;
  word-break: break-all;
  background-color: white;
  border-radius: 8px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CategoryBox = styled.div`
  display: flex;
  align-items: center;
  color: #7c7c7c;
`;

const Nickname = styled.div`
  color: #545454;
`;
const Content = styled.div``;

const BottomContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const LikesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CommentsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const DateWrapper = styled.div`
  color: #909090;
`;

const CategoryBadge = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 8px;
`;

const getCategoryColor = (category: string) => {
  switch (category) {
    case '당일치기':
      return '#99FFB6';
    case '회사':
      return '#DBCAFF';
    case '여행':
      return '#FEFFCA';
    case '일상':
      return '#FFD0D0';
  }
};
