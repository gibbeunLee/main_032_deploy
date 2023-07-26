import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';

function Header() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLogin');
    setIsLogin(false);
  };

  const handleClick = () => {
    if (!isLogin) {
      alert('로그인이 필요합니다.');
    }
  };

  return (
    <HeaderContainer>
      <Link to="/">
        <Logo src={logo} alt="logo" />
      </Link>
      <Nav>
        <LeftContainer>
          <Links to={isLogin ? '/plan' : '/login'} onClick={handleClick}>
            일정 관리
          </Links>
          <Links to="/community">커뮤니티</Links>
        </LeftContainer>
        <RightContainer>
          {isLogin ? (
            <>
              <Links to="/mypage">마이페이지</Links>
              <Links to="/" onClick={handleLogout}>
                로그아웃
              </Links>
            </>
          ) : (
            <>
              <Links to="/login">로그인</Links>
              <SignUpContainer>
                <Links to="/signup">회원가입</Links>
              </SignUpContainer>
            </>
          )}
        </RightContainer>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  width: 100%;
  height: 67px;
  font-size: 16px;
  background-color: white;
`;

const Logo = styled.img`
  width: 140px;
  height: 20px;
  margin-left: 40px;
  cursor: pointer;
  @media screen and (max-width: 600px) {
    margin-left: 20px;
  }
  @media screen and (max-width: 500px) {
    width: 120px;
    height: 16px;
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-left: 40px;
  @media screen and (max-width: 600px) {
    margin-left: 20px;
  }
  @media screen and (max-width: 500px) {
    margin-left: 10px;
  }
`;

const LeftContainer = styled.div`
  display: flex;
  gap: 40px;
  @media screen and (max-width: 600px) {
    gap: 20px;
  }
  @media screen and (max-width: 500px) {
    gap: 10px;
  }
`;

const RightContainer = styled.div`
  display: flex;
  gap: 40px;
  margin-right: 40px;
  @media screen and (max-width: 600px) {
    gap: 20px;
    margin-right: 20px;
  }
`;

const Links = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const SignUpContainer = styled.div`
  @media screen and (max-width: 500px) {
    display: none;
  }
`;
