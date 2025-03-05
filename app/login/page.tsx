"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Row, Col } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';

function SignIn() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [data, setData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      setLoading(true);
        // Autenticar con Firebase Authentication
        await signInWithEmailAndPassword(auth, data.email, data.password);

        router.push('/pedidos');

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Falló el inicio de sesión!');
    }
  };

  const [form] = Form.useForm();

  return (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <div className="mt-6 bg-dark rounded-md dark:bg-dark/80 shadow-regular dark:shadow-none">
          <div className="px-5 py-4 text-center border-b border-gray-200 dark:border-white/10">
            <h2 className="mb-0 text-xl font-semibold text-dark dark:text-white/[.87]">Inicio de Sesión</h2>
          </div>
          <div className="px-10 pt-8 pb-6">
            <Form name="login" form={form} onFinish={handleLogin} layout="vertical">
              <Form.Item
                name="email"
                rules={[{ message: 'Por favor, coloque su email!', required: true }]}
                label="Email"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white/60 [&>div>div>label]:font-medium"
              >
                <Input
                  type="email"
                  value={data.email}
                  placeholder="name@example.com"
                  className="h-12 p-3 hover:border-primary focus:border-primary rounded-4"
                  onChange={(e) =>
                    setData({
                      ...data,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Item>
              <Form.Item
                name="password"
                label="Contraseña"
                className="[&>div>div>label]:text-sm [&>div>div>label]:text-dark dark:[&>div>div>label]:text-white/60 [&>div>div>label]:font-medium"
              >
                <Input.Password
                  onChange={(e) =>
                    setData({
                      ...data,
                      password: e.target.value,
                    })
                  }
                  value={data.password}
                  placeholder="Contraseña"
                  className="h-12 p-3 hover:border-primary focus:border-primary rounded-4"
                />
              </Form.Item>
              <div className="flex flex-wrap items-center justify-between gap-[10px]">
                <Link className="text-primary text-13" href="/forgotPassword">
                  Perdistes la contraseña?
                </Link>
              </div>
              <Form.Item>
                <Button
                  className="w-full bg-primary h-12 p-0 my-6 text-sm font-medium"
                  htmlType="submit"
                  type="primary"
                  size="large"
                >
                  {loading ? 'Cargando...' : 'Login'}
                </Button>
              </Form.Item>
              {error && <p className="text-danger mb-10 text-center text-base">{error}</p>}
            </Form>
          </div>
          <div className="p-6 text-center bg-gray-100 dark:bg-white/10 rounded-b-md">
            <p className="mb-0 text-sm font-medium text-body dark:text-white/60">
              No tienes una cuenta?
              <Link href="/register" className="ltr:ml-1.5 rtl:mr-1.5 text-info hover:text-primary">
                Registrarme
              </Link>
            </p>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default SignIn;