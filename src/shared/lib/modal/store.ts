import {
  createDomain,
  createEffect,
  type Effect,
  type EventCallable,
  type Store,
  type StoreWritable,
  sample,
} from "effector";

/**
 * Конфигурация для создания формы с drawer
 */
interface CreateFormDrawerConfig<FormData, SubmitPayload, SubmitResult, SubmitError = Error> {
  domainName: string;
  drawerName?: string;
  initialFormState: FormData;
  submitEffect: (payload: SubmitPayload) => Promise<SubmitResult>;
  autoCloseOnSuccess?: boolean;
  resetOnSuccess?: boolean;
}

/**
 * Результат создания формы с drawer
 */
interface FormDrawer<FormData, SubmitPayload, SubmitResult, SubmitError = Error> {
  domain: ReturnType<typeof createDomain>;

  // Drawer управление
  toggleDrawer: EventCallable<boolean>;
  openDrawer: EventCallable<void>;
  closeDrawer: EventCallable<void>;
  $isOpen: Store<boolean>;

  // Form управление
  resetForm: EventCallable<void>;
  submitForm: EventCallable<SubmitPayload>;
  submitFormFx: Effect<SubmitPayload, SubmitResult, SubmitError>;

  // Form состояние
  $formState: StoreWritable<FormData>;
  $isSubmitting: Store<boolean>;
  $formError: Store<string | null>;
}

/**
 * Создаёт полноценную форму с drawer и автоматической логикой
 */
export function createFormDrawer<FormData, SubmitPayload, SubmitResult = void, SubmitError = Error>(
  config: CreateFormDrawerConfig<FormData, SubmitPayload, SubmitResult, SubmitError>,
): FormDrawer<FormData, SubmitPayload, SubmitResult, SubmitError> {
  const {
    domainName,
    drawerName = "drawer",
    initialFormState,
    submitEffect,
    autoCloseOnSuccess = true,
    resetOnSuccess = true,
  } = config;

  // Создаём domain
  const domain = createDomain(domainName);

  // Drawer события
  const toggleDrawer = domain.createEvent<boolean>(`${drawerName}/toggle`);
  const openDrawer = domain.createEvent(`${drawerName}/open`);
  const closeDrawer = domain.createEvent(`${drawerName}/close`);

  // Form события
  const resetForm = domain.createEvent("resetForm");
  const submitForm = domain.createEvent<SubmitPayload>("submitForm");

  // Effect
  const submitFormFx = createEffect<SubmitPayload, SubmitResult, SubmitError>(submitEffect);

  // Stores
  const $isOpen = domain.createStore(false, {
    name: `$isOpen${drawerName.charAt(0).toUpperCase() + drawerName.slice(1)}`,
  });

  const $formState = domain.createStore<FormData>(initialFormState, {
    name: `$formState${drawerName}`,
  });

  const $isSubmitting = submitFormFx.pending;

  const $formError = domain
    .createStore<string | null>(null, {
      name: `$formError${drawerName}`,
    })
    .on(submitFormFx.failData, (_, error) => {
      // Проверяем разные типы ошибок
      if (error instanceof Error) {
        return error.message;
      }
      if (typeof error === "string") {
        return error;
      }
      if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
      }
      return String(error);
    })
    .reset(submitForm)
    .reset(submitFormFx.doneData);

  // Drawer логика
  $isOpen
    .on(toggleDrawer, (_, bool) => bool)
    .on(openDrawer, () => true)
    .on(closeDrawer, () => false);

  // Form логика
  if (resetOnSuccess) {
    $formState.reset(submitFormFx.doneData);
  }
  $formState.reset(resetForm);

  // Автозакрытие drawer при успехе
  if (autoCloseOnSuccess) {
    sample({
      clock: submitFormFx.doneData,
      target: closeDrawer,
    });
  }

  // Submit логика
  sample({
    clock: submitForm,
    target: submitFormFx,
  });

  return {
    domain,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    $isOpen,
    resetForm,
    submitForm,
    submitFormFx,
    $formState,
    $isSubmitting,
    $formError,
  };
}

/**
 * Расширяет FormDrawer дополнительными событиями для изменения полей формы
 */
export function extendFormDrawer<
  FormData extends Record<string, unknown>,
  SubmitPayload,
  SubmitResult = void,
  SubmitError = Error,
>(formDrawer: FormDrawer<FormData, SubmitPayload, SubmitResult, SubmitError>) {
  const { domain, $formState } = formDrawer;

  /**
   * Создаёт event для изменения конкретного поля формы
   */
  const createFieldSetter = <K extends keyof FormData>(fieldName: K) => {
    const setter = domain.createEvent<FormData[K]>(`set${String(fieldName)}`);

    $formState.on(setter, (state, value) => ({
      ...state,
      [fieldName]: value,
    }));

    return setter;
  };

  return {
    ...formDrawer,
    createFieldSetter,
  };
}
