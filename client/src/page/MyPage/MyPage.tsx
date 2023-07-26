import styled from 'styled-components';
import { useQuery, useMutation } from 'react-query';
import { useEffect, useState } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import profile from '../../assets/profile.png';
import { deleteUser, getUserInfo, patchUserInfo } from '../../api/service';

interface MyInfoInterface {
  nickname: string;
  name: string;
  email: string;
  password: string;
}

function MyPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<MyInfoInterface>({
    nickname: '',
    name: '',
    email: '',
    password: '',
  });
  const userInfoString = localStorage.getItem('userInfo');
  const parsed = JSON.parse(userInfoString || '{}');
  const { data } = useQuery('getMyPage', () => getUserInfo(parsed.userId));
  const { mutate } = useMutation(
    ['patchMyInfo', editData],
    () => patchUserInfo(parsed.userId || 1, editData),
    {
      onSuccess: (d: { data: { user: MyInfoInterface } }) => {
        alert('저장되었습니다.');
        setEditData(d.data.user);
        setIsEditing(false);
      },
    },
  );

  const { mutate: deleteMutate } = useMutation(
    'deleteUser',
    () => deleteUser(parsed.userId),
    {
      onSuccess: () => {
        alert('탈퇴되었습니다.');
        try {
          localStorage.removeItem('token');
        } catch (e) {
          console.error(e);
        }
        navigate('/');
      },
    },
  );

  useEffect(() => {
    if (data) {
      setEditData(data.data.user);
    }
  }, [data]);

  useEffect(() => {
    // 토큰을 로컬 스토리지나 쿠키에서 가져오기
    const token = localStorage.getItem('token');

    // 토큰을 사용하여 필요한 인증/권한 확인
    if (token) {
      // 토큰이 있는 경우, 인증 처리 진행
      // 필요한 API 호출 등을 수행하여 사용자 정보를 가져올 수 있음
      console.log('토큰 사용 가능');
    } else {
      // 토큰이 없는 경우, 로그인 페이지로 이동 등의 처리
      console.log('토큰 없음, 로그인 필요');
      window.location.href = '/login';
    }
  }, []);

  const onChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [key]: e.target.value });
  };

  const array = [
    { key: 'nickname', label: '닉네임' },
    { key: 'name', label: '이름' },
    { key: 'email', label: '이메일' },
    { key: 'password', label: '비밀번호' },
  ];

  return (
    <MyPageContainer>
      <ProfileContainer>
        <StyledIcon size="20px" />
        <ProfileImg src={profile} />
      </ProfileContainer>
      <InputContainer>
        {array.map(({ key, label }: { key: string; label: string }) => (
          <>
            <InputText>{label}</InputText>
            <Input
              value={editData[key as keyof MyInfoInterface]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(key, e)
              }
              readOnly={isEditing ? false : true}
            />
          </>
        ))}
      </InputContainer>
      <ButtonContainer>
        <QuitButton onClick={() => deleteMutate()}>탈퇴</QuitButton>
        {isEditing ? (
          <EditButton onClick={() => mutate()}>저장</EditButton>
        ) : (
          <EditButton
            onClick={() => {
              setIsEditing(true);
            }}
          >
            수정
          </EditButton>
        )}
      </ButtonContainer>
    </MyPageContainer>
  );
}

export default MyPage;

const MyPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 67px;
  margin-bottom: 200px;
`;

const ProfileImg = styled.img``;

const ProfileContainer = styled.div`
  display: block;
  position: relative;
  margin-top: 80px;
`;

const StyledIcon = styled(IoSettingsOutline)`
  position: absolute;
  right: 0;
  margin: 4px;
`;

const InputContainer = styled.div`
  margin-top: 60px;
`;

const InputText = styled.div`
  margin-top: 20px;
`;

const Input = styled.input`
  width: 240px;
  height: 36px;
  margin-top: 12px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  box-shadow:
    0 0 0 0.3px #98dde3 inset,
    2px 2px 8px #98dde31a;

  &:read-only:focus-visible {
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 80px;
  gap: 16px;
`;

const EditButton = styled.button`
  padding: 6px;
  border-radius: 8px;
  border: 0px;
  width: 60px;
  height: 40px;
  background-color: #98dde3;
  color: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
`;

const QuitButton = styled(EditButton)`
  background-color: #eea9a9;
`;
