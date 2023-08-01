import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Logo from '../../assets/logo.png';
import googleIcon from '../../assets/google.png';
import kakaoIcon from '../../assets/kakao.png';
import githubIcon from '../../assets/github.png';
import { useMutation, UseMutationResult } from 'react-query';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_REACT_APP_SERVER;

// 로그인 요청과 응답을 위한 타입 정의
type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  memberId: number;
  nickname: string;
};

// 특정 제공자의 인증 URL을 가져오는 함수
async function getAuthUrl(provider: string) {
  const response = await fetch(`${apiUrl}/oauth2/authorization/${provider}`);
  const data = await response.json();
  window.location.href = data.url; // 제공자의 인증 페이지로 이동
}

// 코드를 사용하여 토큰을 가져오는 함수
async function getToken(code: string): Promise<LoginResponse> {
  const response = await fetch(`${apiUrl}/oauth2?access_token=${code}`);
  const data = await response.json();
  return data;
}

// Login 컴포넌트
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); // 이메일 상태
  const [password, setPassword] = useState(''); // 비밀번호 상태

  // 로그인 요청을 위한 useMutation 훅
  const loginMutation: UseMutationResult<LoginResponse, unknown, LoginRequest> =
    useMutation(login);

  // 코드를 사용하여 토큰을 가져오고 저장하는 useEffect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      getToken(code)
        .then(data => {
          saveToken(data.token);
          navigate('/');
        })
        .catch(error => {
          alert(error.message);
        });
    }
  }, []);

  // 로그인 요청을 보내는 함수
  async function login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post(`${apiUrl}/user/login`, loginRequest);
    const {
      data: { userId },
      nickname,
    } = response.data;
    saveUserInfo(userId, nickname); // 사용자 정보 저장
    saveToken(response.headers.authorization);
    navigate('/');
    return response.data;
  }

  // 로그인 폼 제출 핸들러
  function formSubmitLoginHandler() {
    if (!email && !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
    } else if (!isValidEmail(email)) {
      alert('이메일을 잘못 입력하셨습니다.');
    } else if (!isValidPassword(password)) {
      alert('비밀번호가 틀렸습니다.');
    } else {
      loginMutation.mutate({ email, password });
    }
  }

  // 이메일 유효성 검사 함수
  function isValidEmail(email: string) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  // 비밀번호 유효성 검사 함수
  function isValidPassword(password: string) {
    const isLongEnough = password.length >= 8;
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/g;
    const specialCharacterCount = (password.match(specialCharacterRegex) || [])
      .length;
    const hasEnoughSpecialCharacters = specialCharacterCount >= 2;
    return isLongEnough && hasEnoughSpecialCharacters;
  }

  // 사용자 정보를 로컬 스토리지에 저장하는 함수
  function saveUserInfo(userId: number, nickname: string): void {
    const userInfo = {
      userId,
      nickname,
    };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }

  // 토큰을 로컬 스토리지에 저장하는 함수
  function saveToken(token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('isLogin', 'true');
  }

  // OAuth 로그인 핸들러
  function handleOAuthLogin(provider: string) {
    getAuthUrl(provider);
  }

  return (
    <LoginSection>
      <LoginFormSection>
        {/* 로그인 폼 */}
        <LoginForm>
          {/* 로고 이미지 */}
          <LogoImg src={Logo} alt="logo" />
          {/* 입력 필드 섹션 */}
          <LoginInputSection>
            {/* 이메일 입력 부분의 텍스트 */}
            <LoginInputText>이메일</LoginInputText>
            {/* 이메일 입력란 */}
            <LoginInput
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            {/* 비밀번호 입력 부분의 텍스트 */}
            <LoginInputText>비밀번호</LoginInputText>
            {/* 비밀번호 입력란 */}
            <LoginInput
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />
          </LoginInputSection>
          <LoginBorder />
          {/* 회원가입 및 로그인 버튼 섹션 */}
          <LoginButtonSection>
            {/* 로그인 버튼 */}
            <LoginButton onClick={formSubmitLoginHandler}>로그인</LoginButton>
            {/* 회원가입 버튼 */}
            <SignUpButton to="/signup">회원가입</SignUpButton>
          </LoginButtonSection>
        </LoginForm>
        {/* 각 OAuth 서비스로 로그인 할 수 있는 버튼을 담고 있는 영역 */}
        <LoginOAuthSection>
          {/* Google을 통한 로그인 버튼 */}
          <OAuthGoogle onClick={() => handleOAuthLogin('google')}>
            Log in with Google
          </OAuthGoogle>
          {/* Kakao을 통한 로그인 버튼 */}
          <OAuthKakao onClick={() => handleOAuthLogin('kakao')}>
            Log in with Kakao
          </OAuthKakao>
          {/* Github을 통한 로그인 버튼 */}
          <OAuthGithub onClick={() => handleOAuthLogin('github')}>
            Log in with Github
          </OAuthGithub>
        </LoginOAuthSection>
      </LoginFormSection>
    </LoginSection>
  );
}

export default Login;

const LoginSection = styled.div`
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-top: 90px;
  padding-bottom: 60px;
`;

const LoginFormSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoginForm = styled.div`
  background-color: #fbfbfb;
  border-radius: 25px;
  height: 378px;
  max-width: 400px;
  width: 100%;
  margin: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  box-shadow: 3px 4px 4px rgb(152, 221, 227, 0.25);
`;

const LogoImg = styled.img`
  width: 176px;
  margin-top: 16px;
  padding: 20px;
`;

const LoginInputSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
`;

const LoginInputText = styled.div`
  display: flex;
  justify-content: start;
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 8px;
  max-width: 500px;
`;

const LoginInput = styled.input`
  height: 33px;
  width: 283px;
  border: 1px solid #98dde3;
  border-radius: 6px;
  box-shadow: 2px 4px 4px rgb(152, 221, 227, 0.25);
  padding-inline-start: 10px;
`;

const LoginBorder = styled.div`
  margin-top: 30px;
  width: 300px;
  border-bottom: 1px solid #98dde3;
`;

const LoginButtonSection = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 15px;
`;

const LoginButton = styled.button`
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 144px;
  height: 38px;
  margin: 8px;
  padding: 8px;
  border-radius: 6px;
  font-size: 16px;
  color: black;
  background-color: white;
  border: 1px solid #98dde3;
  box-shadow: 2px 4px 4px rgb(152, 221, 227, 0.25);
  cursor: pointer;
`;

const SignUpButton = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 126px;
  height: 20px;
  margin: 8px;
  padding: 8px;
  border-radius: 6px;
  font-size: 16px;
  color: black;
  border: 1px solid #ffffff;
  background-color: #98dde3;
  box-shadow: 2px 4px 4px rgb(152, 221, 227, 0.25);
  cursor: pointer;
`;

const LoginOAuthSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  padding: 16px;
`;

const OAuthGoogle = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(${googleIcon});
  background-size: 19px;
  background-position: 47px;
  background-repeat: no-repeat;
  width: 284px;
  height: 35px;
  margin: 8px;
  padding: 8px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #98dde3;
  background-color: white;
  box-shadow: 2px 4px 4px rgb(152, 221, 227, 0.25);
  cursor: pointer;
`;

const OAuthKakao = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(${kakaoIcon});
  background-size: 19px;
  background-position: 47px;
  background-repeat: no-repeat;
  width: 284px;
  height: 35px;
  margin: 8px;
  padding: 8px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #98dde3;
  background-color: white;
  box-shadow: 2px 4px 4px rgb(152, 221, 227, 0.25);
  cursor: pointer;
`;

const OAuthGithub = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(${githubIcon});
  background-size: 19px;
  background-position: 47px;
  background-repeat: no-repeat;
  width: 284px;
  height: 35px;
  margin: 8px;
  padding: 8px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #98dde3;
  background-color: white;
  box-shadow: 2px 4px 4px rgb(152, 221, 227, 0.25);
  cursor: pointer;
`;
