import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  phone: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (phone: string, name: string): Promise<{ success: boolean; error?: string }> => {
    // 管理员账号
    if (phone === 'admin' && name === 'admin') {
      const adminUser: User = {
        id: 'admin',
        phone: 'admin',
        name: '管理员',
        isAdmin: true,
      };
      setUser(adminUser);
      return { success: true };
    }

    // 普通用户 - 查询 Supabase
    if (!supabase) {
      return { success: false, error: '系统未配置 Supabase' };
    }

    try {
      // 查询用户是否存在
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (existingUser) {
        // 用户存在，验证姓名
        if (existingUser.name !== name) {
          return { success: false, error: '手机号与姓名不匹配' };
        }
        setUser({
          id: existingUser.id,
          phone: existingUser.phone,
          name: existingUser.name,
          isAdmin: false,
        });
        return { success: true };
      }

      // 用户不存在，创建新用户
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ phone, name }])
        .select()
        .single();

      if (insertError) {
        return { success: false, error: '创建用户失败：' + insertError.message };
      }

      setUser({
        id: newUser.id,
        phone: newUser.phone,
        name: newUser.name,
        isAdmin: false,
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.isAdmin ?? false;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
