import { logoBlackBgVertical, logoWhiteBgVertical } from '@/dashboard/assets'
import { InputField, Spacer } from '@/dashboard/components'
import { Formik, Form } from 'formik'
import { Grid } from '@/dashboard/components/shadcn-ui/grid'
import { LoadingButton } from '@/dashboard/components/shadcn-ui/loading-button'
import { useLogin } from './hooks'
import { loginSchema } from './validation'
export const Login = () => {
  const { handleLogin } = useLogin()

  return (
    <main>
      <div className={'w-full h-screen grid place-items-center'}>
        <Grid container className={'flex-nowrap overflow-hidden relative z-[2] h-screen w-screen'}>
          {/* Left side (md+) */}
          <Grid size={{ md: 6 }} className={'py-4 hidden md:grid place-items-center bg-primary'}>
            <img
              src={logoBlackBgVertical}
              alt={'login-bg'}
              className={'w-[200px] h-[250px]'}
            />
          </Grid>
          {/* Right side */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Formik
              validationSchema={loginSchema}
              initialValues={{ email: '', password: '' }}
              onSubmit={(values, { setSubmitting }) => {
                handleLogin(values).catch(() => undefined).finally(() => setSubmitting(false))
              }}>
              {({ handleSubmit, isSubmitting }) => (
                <div className={'h-full flex flex-col border border-[#eee] py-4 px-6 sm:px-6 bg-white'}>
                  <Form onSubmit={handleSubmit} className={'grid place-items-center h-full w-full'}>
                    <div>
                      <div className={'text-center py-4'}>
                        <div className={'flex justify-center mb-6 md:hidden'}>
                          <img
                            src={logoWhiteBgVertical}
                            alt={'login-bg'}
                            className={'w-[150px] h-[187px]'}
                          />
                        </div>
                        <p className={'text-primary text-[24px] md:text-[32px] font-semibold'}>
                          {'تسجيل الدخول'}
                        </p>
                        <p className={'text-foreground text-[16px] md:text-[18px]'}>
                          {'يرجى كتابة البريد الإلكتروني وكلمة المرور للدخول إلى لوحة التحكم'}
                        </p>
                      </div>

                      <Spacer space={30} />

                      <div>
                        <InputField name={'email'} label={'اسم المستخدم'} type={'email'}/>
                        <InputField name={'password'} label={'كلمة المرور'} type={'password'} />
                      </div>
                      <Spacer space={8} />

                      <div className={'[&_button]:w-full'}>
                        <LoadingButton loading={isSubmitting} type={'submit'}>
                          تسجيل الدخول
                        </LoadingButton>
                      </div>
                    </div>
                  </Form>
                </div>
              )}
            </Formik>
          </Grid>
        </Grid>
      </div>
    </main>
  )
}

