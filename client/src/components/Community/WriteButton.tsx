import styled from 'styled-components';
import { PiPencilSimple } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

function WriteButton() {
  const token = localStorage.getItem('isLogin');
  const navigate = useNavigate();

  // 토큰이 있으면 로그인 된 상태
  // 토큰이 없으면 로그인 안된 상태
  // 토큰이 없으면 로그인이 필요하다는 문구, 출력
  // 로그인 페이지로 이동
  // 토큰이 있으면 등록으로 이동
  const onClick = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
    }
    navigate(token ? '/community/registration/0' : '/login');
  };

  return (
    <WriteButtonBtn onClick={onClick}>
      <PiPencilSimple size="22px" />
    </WriteButtonBtn>
  );
}

export default WriteButton;

const WriteButtonBtn = styled.button`
  min-width: 44px;
  min-height: 44px;
  background: #98dde3;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 25px;
  border: none;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
`;
