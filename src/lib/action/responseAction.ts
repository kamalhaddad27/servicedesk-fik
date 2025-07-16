export type responAction = {
  success?: {
    status: boolean;
    message?: string;
  };
  error?: {
    status: boolean;
    message?: string;
  };
  data?: any;
};

type responActionProps = {
  statusSuccess?: boolean;
  statusError?: boolean;
  messageSuccess?: string;
  messageError?: string;
  data?: any;
};

export function responAction({
  statusSuccess,
  statusError,
  messageSuccess,
  messageError,
  data,
}: responActionProps) {
  return {
    success: {
      status: statusSuccess,
      message: messageSuccess,
    },
    error: {
      status: statusError,
      message: messageError,
    },
    data: data,
  };
}
