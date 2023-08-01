import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_REACT_APP_SERVER;

export const getCommunityList = async (query: {
    pageSize?: number
    page?: number
    search?: string
    category?: string
}) => {
  const { pageSize, page, search, category } = query;
  try {

    if (search) {
      const response = await axios.get(
        `/community/search?query=${search}`
      );
      return response.data;
    }

    const response = await axios.get(
      `/community/${category || 'all'}?size=${pageSize || 10}&page=${page || 1}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};


// my page
export const deleteUser = async (userId?: number) => {
try {
  const token = localStorage.getItem('token')
  // TODO: axios.delete가 맞는지 BE랑 확인 필요
  const response = await axios.delete(
    `/user/delete/${userId || 1}`,
    {
      headers: {Authorization: token}
    }
  );

  return response.data;
} catch (error) {
  return error;
}
};

export const getUserInfo = async (userId?: number) => {
try {
  const token = localStorage.getItem('token')
  const response = await axios.get(
    `/user/${userId || 1}`,
    {
      headers: {Authorization: token}
    }
  );

  return response.data;
} catch (error) {
  return error;
}
};

export const patchUserInfo = async (userId: number, body: {
  name: string
  nickname: string
  password: string
  email: string
}) => {
try {
  const token = localStorage.getItem('token')
  const response = await axios.patch(
    `/user/edit/${userId || 1}`,
    body,
    {
      headers: {Authorization: token}
    }
  );

  return response.data;
} catch (error) {
  return error;
}
};
