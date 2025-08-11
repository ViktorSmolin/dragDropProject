export enum ErrorType {
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  COLUMN_NOT_FOUND = 'COLUMN_NOT_FOUND',
  INVALID_DROP_TARGET = 'INVALID_DROP_TARGET',
  DRAG_DATA_CORRUPTED = 'DRAG_DATA_CORRUPTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: number;
  action?: string;
  recoverable: boolean;
}

export class ErrorHandler {
  private static errors: AppError[] = [];
  private static maxErrors = 50;

  static createError(
    type: ErrorType, 
    message: string, 
    details?: any, 
    action?: string,
    recoverable: boolean = true
  ): AppError {
    const error: AppError = {
      type,
      message,
      details,
      timestamp: Date.now(),
      action,
      recoverable
    };

    this.logError(error);
    this.storeError(error);
    
    return error;
  }

  private static logError(error: AppError): void {
    const emoji = this.getErrorEmoji(error.type);
    const severity = error.recoverable ? 'WARN' : 'ERROR';
    
    console.group(`${emoji} [${severity}] ${error.type}`);
    console.log('Message:', error.message);
    console.log('Timestamp:', new Date(error.timestamp).toLocaleString());
    
    if (error.action) {
      console.log('Action:', error.action);
    }
    
    if (error.details) {
      console.log('Details:', error.details);
    }
    
    console.trace('Stack trace:');
    console.groupEnd();
  }

  private static storeError(error: AppError): void {
    this.errors.unshift(error);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
  }

  private static getErrorEmoji(type: ErrorType): string {
    const emojiMap = {
      [ErrorType.TASK_NOT_FOUND]: '🔍',
      [ErrorType.COLUMN_NOT_FOUND]: '📂',
      [ErrorType.INVALID_DROP_TARGET]: '🚫',
      [ErrorType.DRAG_DATA_CORRUPTED]: '💥',
      [ErrorType.PERMISSION_DENIED]: '🔒',
      [ErrorType.NETWORK_ERROR]: '🌐',
      [ErrorType.VALIDATION_ERROR]: '⚠️',
      [ErrorType.UNKNOWN_ERROR]: '❓'
    };
    
    return emojiMap[type] || '❓';
  }

  static getErrors(): AppError[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
    console.log('🧹 Журнал ошибок очищен');
  }

  static getErrorStats(): { total: number; byType: Record<ErrorType, number> } {
    const byType = this.errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<ErrorType, number>);

    return {
      total: this.errors.length,
      byType
    };
  }
}

export const createTaskNotFoundError = (taskId: string, action: string) =>
  ErrorHandler.createError(
    ErrorType.TASK_NOT_FOUND,
    `Задача с ID "${taskId}" не найдена`,
    { taskId },
    action
  );

export const createColumnNotFoundError = (columnId: string, action: string) =>
  ErrorHandler.createError(
    ErrorType.COLUMN_NOT_FOUND,
    `Колонка с ID "${columnId}" не найдена`,
    { columnId },
    action
  );

export const createInvalidDropError = (reason: string, details?: any) =>
  ErrorHandler.createError(
    ErrorType.INVALID_DROP_TARGET,
    `Недопустимая цель для перетаскивания: ${reason}`,
    details,
    'drop'
  );

export const createDragDataError = (details?: any) =>
  ErrorHandler.createError(
    ErrorType.DRAG_DATA_CORRUPTED,
    'Данные перетаскивания повреждены или отсутствуют',
    details,
    'drag'
  );