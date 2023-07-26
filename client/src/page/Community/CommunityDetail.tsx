import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import likeIcon from '../../assets/likeIcon.png';
import likeIconRed from '../../assets/likeIconRed.png';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_REACT_APP_SERVER;

// CommunityPost와 UserInfo에 대한 타입 정의
type CommunityPost = {
  communityId: number;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  userInfo: {
    memberId: number;
    nickname: string;
    email: string;
  };
  like: number;
  comments: Array<{
    commentId: string;
    commentBody: string;
    createdAt: string;
    commenterImage: string;
    likes: number;
  }>;
};

type UserInfo = {
  memberId: number;
  nickname: string;
  profileImage: string;
};

function CommunityDetail() {
  // URL에서 communityId 파라미터 가져오기
  const { communityId } = useParams<{ communityId: string }>();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [userCommentBody, setUserCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [like, setLike] = useState(0);
  const [commentLikes, setCommentLikes] = useState<{
    [commentId: string]: boolean;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
    fetchUserInfo();
  }, []);

  // 게시물 가져오는 함수
  async function fetchPost() {
    try {
      // const communityPost: CommunityPost = {
      //   communityId: 1,
      //   title: '워터밤 가면 좋겠다',
      //   content:
      //     '워터밤은 고글필수지 이번행사 라인업 보니까 존잼 차갑고 투명한 내 맘 아래천천...워터밤은 고글필수지 이번행사 라인업 보니까 존잼 차갑고 투명한 내 맘 아래천천...',
      //   category: '회사',
      //   like: 3,
      //   createdAt: '2023-07-15-12:00',
      //   writer: {
      //     memberId: 1,
      //     nickname: '복실한 사모예드',
      //   },
      //   comments: [
      //     {
      //       commentId: '혜인',
      //       commentBody: '몰라잉',
      //       createdAt: '2023-07-15-13:00',
      //       commenterImage: 'https://via.placeholder.com/400',
      //       likes: 2,
      //     },
      //     {
      //       commentId: '예리',
      //       commentBody: '뭐라는겨',
      //       createdAt: '2023-07-15-14:00',
      //       commenterImage: 'https://via.placeholder.com/400',
      //       likes: 1,
      //     },
      //     {
      //       commentId: '지윤',
      //       commentBody: '으윽;',
      //       createdAt: '2023-07-16-15:00',
      //       commenterImage: 'https://via.placeholder.com/400',
      //       likes: 0,
      //     },
      //   ],
      // };
      // 서버에서 데이터 가져오는 요청
      const response = await axios.get(`${apiUrl}/community/detail/${communityId}`);
      const communityPost: CommunityPost = response.data;
      setPost(communityPost);
      setLike(communityPost.like);
      setCommentLikes(
        communityPost.comments.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.commentId]: false,
          }),
          {},
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  // 사용자 정보 가져오는 함수
  async function fetchUserInfo() {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      const { memberId, nickname, profileImage } = JSON.parse(savedUser);
      setUserInfo({ memberId, nickname, profileImage });
      setNickname(nickname);
      setProfileImage(profileImage);
    }
  }

  // 댓글 제출 처리 함수
  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 서버로 댓글 데이터를 전송하는 요청
      const response = await axios.post(`${apiUrl}/community/${communityId}/comments`, {
        commentBody: userCommentBody, // 새로운 상태 변수 사용
      });

      // 요청이 성공하면 게시물 데이터를 다시 가져오고, 댓글 입력 필드를 초기화
      if (response.status === 200) {
        fetchPost();
        setUserCommentBody(''); // 새로운 상태 변수 초기화
      }
    } catch (error) {
      console.error(error);
    }
  }

  // 수정 버튼 클릭 처리 함수
  function handleEditButtonClick() {
    navigate(`${apiUrl}/community/edit/${communityId}`, { state: { post } });
  }

  // 게시물 좋아요 클릭 처리 함수
  async function handlePostLikeClick() {
    if (isLiked) {
      setLike(prevLike => prevLike - 1);
      try {
        // 좋아요 취소 요청
        await axios.delete(`${apiUrl}/community/like/${communityId}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      setLike(prevLike => prevLike + 1);
      try {
        // 좋아요 등록 요청
        await axios.post(`${apiUrl}/community/like/${communityId}`);
      } catch (error) {
        console.error(error);
      }
    }
    setIsLiked(prevIsLiked => !prevIsLiked);
  }

  // 댓글 좋아요 클릭 처리 함수
  function handleCommentLikeClick(commentId: string) {
    setPost(prevPost => {
      if (prevPost) {
        const updatedComments = prevPost.comments.map(comment => {
          if (comment.commentId === commentId) {
            return {
              ...comment,
              likes: commentLikes[commentId]
                ? comment.likes - 1
                : comment.likes + 1,
            };
          }
          return comment;
        });

        return {
          ...prevPost,
          comments: updatedComments,
        };
      }

      return prevPost;
    });

    setCommentLikes(prevCommentLikes => ({
      ...prevCommentLikes,
      [commentId]: !prevCommentLikes[commentId],
    }));

    if (commentLikes[commentId]) {
      // 좋아요 취소 요청
      axios
        .delete(`${apiUrl}/community/${communityId}/comments/like/${commentId}`)
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      // 좋아요 등록 요청
      axios
        .post(`${apiUrl}/community/${communityId}/comments/like/${commentId}`)
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  // 댓글 수정 버튼 클릭 처리 함수
  async function handleCommentEditClick(
    commentId: string,
    newCommentBody: string,
  ) {
    if (userInfo) {
      try {
        // 서버에 댓글 수정 요청
        await axios.patch(
          `${apiUrl}/community/${communityId}/comments/${commentId}`,
          {
            commentBody: newCommentBody,
          },
        );
        // 수정 후 게시물 데이터를 다시 가져오고, 현재 수정 중인 댓글 아이디를 초기화
        fetchPost();
        setEditingCommentId('');
      } catch (error) {
        console.error(error);
      }
    }
  }

  // 댓글 삭제 버튼 클릭 처리 함수
  async function handleCommentDeleteClick(commentId: string) {
    if (userInfo) {
      try {
        // 서버에 댓글 삭제 요청
        await axios.delete(
          `${apiUrl}/community/${communityId}/comments/${commentId}`,
        );
        // 삭제 후 게시물 데이터를 다시 가져옴
        fetchPost();
      } catch (error) {
        console.error(error);
      }
    }
  }

  // 게시물이 로딩 중일 때 로딩 메시지 출력
  if (!post) {
    return <div>Loading...</div>;
  }

  // 현재 사용자가 게시물 작성자인지 확인
  const isAuthor = userInfo && post.writer.memberId === userInfo.memberId;

  return (
    <DetailSection>
      {/* 게시물 편집 섹션 */}
      <EditSection>
        <EditForm>
          {/* 게시물 제목 */}
          <TitleText>{post.title}</TitleText>
          <RowSection>
            {/* 게시물 카테고리 뱃지 */}
            <CategoryBadge
              style={{ backgroundColor: getCategoryColor(post.category) }}
            />
            <CategoryText>{post.category}</CategoryText>
            {/* 게시물 작성자 닉네임 */}
            <NicknameText>{post.writer.nickname}</NicknameText>
          </RowSection>
          <Border />
          <MiddleSection>
            <RowSection>
              {/* 게시물 좋아요 아이콘 */}
              <LikeIcon
                src={isLiked ? likeIconRed : likeIcon}
                className={isLiked ? 'liked' : ''}
                onClick={handlePostLikeClick}
              />
              {/* 게시물 좋아요 수 */}
              <LikeText>{like}</LikeText>
            </RowSection>
            {/* 게시물 내용 */}
            <ContentText>{post.body}</ContentText>
          </MiddleSection>
          <RowSection>
            <ContentText>댓글</ContentText>
            {/* 댓글 수 */}
            <BoldText>{post.comments.length}</BoldText>
            {/* 게시물 작성일 */}
            <NicknameText>{post.createdAt}</NicknameText>
          </RowSection>
          <Border />
          <ButtonSection>
            {/* 게시물 작성자일 경우 수정 버튼 */}
            {isAuthor && (
              <EditButton onClick={handleEditButtonClick}>수정</EditButton>
            )}
            {/* 목록으로 돌아가는 버튼 */}
            <DeleteButton to="/community">목록</DeleteButton>
          </ButtonSection>
          {post.comments.map(comment => {
            const isCommentAuthor =
              userInfo && comment.commentId === userInfo.nickname;
            return (
              <CommentSection key={comment.commentId}>
                {/* 댓글 작성자 이미지 */}
                <CommenterImage
                  src={comment.commenterImage}
                  alt="CommenterImg"
                />
                <ColumSection>
                  {/* 댓글 작성자 */}
                  <UpText>{comment.commentId}</UpText>
                  {editingCommentId === comment.commentId ? (
                    // 댓글 수정 입력 필드
                    <CommentInput
                      value={newCommentBody}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewCommentBody(e.target.value)
                      }
                    />
                  ) : (
                    // 댓글 내용
                    <ContentText>{comment.commentBody}</ContentText>
                  )}
                  <ButtonRow>
                    {isCommentAuthor &&
                    editingCommentId === comment.commentId ? (
                      <>
                        {/* 댓글 수정 취소 버튼 */}
                        <CommentCancelButton
                          onClick={() => setEditingCommentId('')}
                        >
                          취소
                        </CommentCancelButton>
                        {/* 댓글 수정 완료 버튼 */}
                        <CommentEditButton
                          onClick={() =>
                            handleCommentEditClick(
                              comment.commentId,
                              newCommentBody,
                            )
                          }
                        >
                          완료
                        </CommentEditButton>
                      </>
                    ) : (
                      isCommentAuthor && (
                        // 댓글 수정 버튼
                        <CommentEditButton
                          onClick={() => setEditingCommentId(comment.commentId)}
                        >
                          수정
                        </CommentEditButton>
                      )
                    )}
                    {isCommentAuthor && (
                      // 댓글 삭제 버튼
                      <CommentDeleteButton
                        onClick={() =>
                          handleCommentDeleteClick(comment.commentId)
                        }
                      >
                        삭제
                      </CommentDeleteButton>
                    )}
                  </ButtonRow>
                </ColumSection>

                {/* 댓글 작성일 */}
                <DownText>{comment.createdAt}</DownText>

                {/* 댓글 좋아요 아이콘 */}
                <CommentLikeIcon
                  src={commentLikes[comment.commentId] ? likeIconRed : likeIcon}
                  className={commentLikes[comment.commentId] ? 'liked' : ''}
                  onClick={() => handleCommentLikeClick(comment.commentId)}
                />
                {/* 댓글 좋아요 수 */}
                <CommentLikeText>{comment.likes}</CommentLikeText>
              </CommentSection>
            );
          })}
          <Border />
          {/* 사용자 댓글 입력 섹션 */}
          <UserCommentSection onSubmit={handleCommentSubmit}>
            {/* 사용자 프로필 이미지 */}
            <UserImage src={profileImage} alt="Profile" />
            <ColumSection>
              {/* 사용자 닉네임 */}
              <UserNickName>{nickname}</UserNickName>
              {/* 사용자 댓글 입력 필드 */}
              <UserCommentInput
                value={userCommentBody}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUserCommentBody(e.target.value)
                }
              />
              {/* 댓글 작성 버튼 */}
              <UserCommentButton type="submit">작성</UserCommentButton>
            </ColumSection>
          </UserCommentSection>
        </EditForm>
      </EditSection>
    </DetailSection>
  );
}

export default CommunityDetail;

const DetailSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  padding-top: 90px;
  padding-bottom: 60px;
`;

const EditSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 900px;
  width: 100%;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #98dde3;
  background-color: white;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  max-width: 800px;
  width: 100%;
`;

const TitleText = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const CategoryText = styled.div`
  font-size: 15px;
  color: #7c7c7c;
`;

const NicknameText = styled.div`
  font-size: 16px;
  color: #545454;
  margin-left: auto;
`;

const ContentText = styled.div`
  font-size: 16px;
`;

const RowSection = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 8px;
`;

const Border = styled.div`
  margin-top: 8px;
  border-bottom: 1px solid #98dde3;
`;

const MiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 700px;
`;

const LikeIcon = styled.img`
  height: 25px;
  width: 25px;
  margin-left: auto;
  margin-bottom: 8px;
  cursor: pointer;

  &.liked {
    filter: brightness(1.2);
  }
`;

const LikeText = styled.div`
  font-size: 18px;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  margin-left: 16px;
  margin-top: 4px;
`;

const BoldText = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-left: 8px;
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  margin-bottom: 16px;
  height: 37px;
`;

const EditButton = styled.button`
  padding: 6px;
  border-radius: 8px;
  border: 0px;
  width: 60px;
  background-color: #98dde3;
  color: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
`;

const DeleteButton = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  border: 0px;
  width: 48px;
  background-color: #eea9a9;
  color: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  margin-left: 12px;
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: row;
  padding: 4px;
  margin-top: 8px;
  margin-bottom: 16px;
  height: 95px;
`;

const CommenterImage = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  margin-right: 20px;
`;

const ColumSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  width: 100%;
  max-width: 500px;
`;

const UpText = styled.div`
  font-size: 14px;
  color: #545454;
  margin-bottom: 4px;
`;

const DownText = styled.div`
  margin-left: auto;
  margin-top: 30px;
  font-size: 14px;
  color: #909090;
`;

const CommentInput = styled.input`
  font-size: 16px;
  height: 75px;
  max-width: 430px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 2px solid #d9d9d9;
`;

const CommentLikeIcon = styled.img`
  height: 20px;
  width: 20px;
  margin-top: 28px;
  margin-left: auto;
  margin-bottom: 8px;
  cursor: pointer;

  &.liked {
    filter: brightness(1.2);
  }
`;

const CommentLikeText = styled.div`
  font-size: 15px;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
  margin-top: 26px;
  margin-right: 20px;
`;

const ButtonRow = styled.div`
  display: flex;
  margin-top: 8px;
  height: 30px;
`;

const CommentEditButton = styled.button`
  padding: 6px;
  border-radius: 8px;
  border: 0px;
  width: 35px;
  background-color: #98dde3;
  color: white;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  margin-right: 8px;
`;

const CommentDeleteButton = styled.button`
  padding: 6px;
  border-radius: 8px;
  border: 0px;
  width: 35px;
  background-color: #eea9a9;
  color: white;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
`;

const CommentCancelButton = styled.button`
  margin-right: 8px;
  padding: 6px;
  border-radius: 8px;
  border: 0px;
  width: 35px;
  background-color: #dbcaff;
  color: white;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
`;

const UserCommentSection = styled.div`
  display: flex;
  margin-top: 20px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  max-width: 750px;
  width: 100%;
`;

const UserImage = styled.img`
  height: 60px;
  width: 60px;
  border-radius: 50%;
  margin-left: 20px;
`;

const UserNickName = styled.div`
  font-size: 17px;
  color: #545454;
  margin-bottom: 8px;
  margin-left: 20px;
  margin-top: 16px;
`;

const UserCommentInput = styled.input`
  font-size: 16px;
  height: 34px;
  max-width: 600px;
  margin-left: 20px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 2px solid #d9d9d9;
`;

const UserCommentButton = styled.button`
  font-size: 14px;
  padding: 6px;
  border-radius: 10px;
  border: 2px solid #b9f5fa;
  height: 35px;
  width: 58px;
  background-color: #98dde3;
  color: white;
  cursor: pointer;
  margin-left: auto;
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
