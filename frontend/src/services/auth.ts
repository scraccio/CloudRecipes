import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { ref } from "vue"

const client = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_COGNITO_REGION,
});

export const userId = ref<string | null>(null)

const USER_POOL_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;

export async function login(email: string, password: string): Promise<string> {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: USER_POOL_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const response = await client.send(command);

  const token = response.AuthenticationResult?.IdToken;

  if (!token) {
    throw new Error("Token non ricevuto");
  }

  return token;
}

export async function register(
  email: string,
  password: string,
  name: string,
  surname: string,
  nickname: string
): Promise<void> {
  const command = new SignUpCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "custom:name", Value: name },
      { Name: "custom:surname", Value: surname },
      { Name: "custom:nickname", Value: nickname }
    ]
  })

  await client.send(command)
}

export async function confirmRegistration(
  email: string,
  code: string
): Promise<void> {
  const command = new ConfirmSignUpCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });

  await client.send(command);
}

export function storeToken(token: string) {
  localStorage.setItem("id_token", token);
}

export function getStoredToken(): string | null {
  return localStorage.getItem("id_token");
}

export function clearStoredToken() {
  localStorage.removeItem("id_token");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("id_token")
}

export function setUserFromToken(token: string) {
  const payload = JSON.parse(atob(token.split(".")[1]!))
  userId.value = payload.sub
}

export function clearUser() {
  userId.value = null
}