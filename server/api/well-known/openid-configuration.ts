export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  return {
    "authorization_endpoint": `${config.public.siteUrl}/auth/authorize`,
    "grant_types_supported": [
      "authorization_code",
      "implicit",
      "refresh_token",
    ],
    "id_token_signing_alg_values_supported": [
      "HS512",
    ],
    "issuer": config.public.solarpassUrl,
    "response_types_supported": [
      "code",
      "token",
    ],
    "subject_types_supported": [
      "public",
    ],
    "token_endpoint": `${config.public.solarNetworkApi}/cgi/auth/auth/token`,
    "token_endpoint_auth_methods_supported": [
      "client_secret_post",
    ],
    "token_endpoint_auth_signing_alg_values_supported": [
      "HS512",
    ],
    "userinfo_endpoint": `${config.public.solarNetworkApi}/cgi/auth/users/me`,
  }
})
