import { createGate } from "effector-react";
import { createEffect, createStore, sample } from "effector";
import { User } from "entity/user/model";

export const UserGate = createGate();

export const $userInfo = createStore<User.Entity | null>(null);

export const fetchUserInfoFx = createEffect(async () => {
  try {
    const response = await fetch("/user/api", {
      method: "GET",
    });
    return (await response.json()) as User.Entity;
  } catch (e) {
    return null;
  }
});

sample({
  clock: UserGate.open,
  target: fetchUserInfoFx,
});

$userInfo.on(fetchUserInfoFx.doneData, (_, user) => user);
