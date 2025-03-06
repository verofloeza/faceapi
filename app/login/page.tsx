"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Row, Col } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuth } from "@/context/AuthContext";

function SignIn() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [data, setData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      router.push("/pedidos");
    }
  }, [user, mounted, router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/pedidos');
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Falló el inicio de sesión!');
    }
  };

  const [form] = Form.useForm();

  return mounted ? (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <div className="mt-6 bg-dark rounded-md dark:bg-dark/80 shadow-regular dark:shadow-none">
          <div className="px-5 py-4 text-center border-b border-gray-200 dark:border-white/10">
            <h2 className="mb-0 text-xl font-semibold text-dark dark:text-white/[.87]">
              Inicio de Sesión
            </h2>
          </div>
          <div className="px-10 pt-8 pb-6">
            <Form name="login" form={form} onFinish={handleLogin} layout="vertical">
              <Form.Item
                name="email"
                rules={[{ message: "Por favor, coloque su email!", required: true }]}
                label="Email"
              >
                <Input
                  type="email"
                  value={data.email}
                  placeholder="name@example.com"
                  onChange={(e) =>
                    setData({
                      ...data,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Item>
              <Form.Item name="password" label="Contraseña">
                <Input.Password
                  onChange={(e) =>
                    setData({
                      ...data,
                      password: e.target.value,
                    })
                  }
                  value={data.password}
                  placeholder="Contraseña"
                />
              </Form.Item>
              <Form.Item>
                <Button className="w-full bg-primary h-12 p-0 my-6" htmlType="submit" type="primary">
                  {loading ? "Cargando..." : "Login"}
                </Button>
              </Form.Item>
              {error && <p className="text-danger text-center">{error}</p>}
            </Form>
          </div>
        </div>
      </Col>
    </Row>
  ) : null;
}

export default SignIn;
