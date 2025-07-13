// DHTMLX Trial React Gantt type definitions
declare module '@dhtmlx/trial-react-gantt' {
  import { ReactNode } from 'react';

  export interface Task {
    id: string;
    text: string;
    start_date?: Date;
    end_date?: Date;
    progress?: number;
    color?: string;
    textColor?: string;
    [key: string]: any;
  }

  export interface GanttConfig {
    scales?: Array<
      | {
          unit?: string;
          step?: number;
          format?: string;
        }
      | boolean
    >;
    startDate?: Date;
    endDate?: Date;
    [key: string]: any;
  }

  export interface ReactGanttProps {
    tasks: Task[];
    config?: GanttConfig;
    height?: string;
    width?: string;
    theme?: 'material' | 'material-dark' | 'default' | string;
    links?: any[];
    onTaskClick?: (task: Task) => void;
    onTaskDoubleClick?: (task: Task) => void;
    onLinkClick?: (link: any) => void;
    onTaskDrag?: (task: Task, start: Date, end: Date) => void;
    onTaskDrop?: (task: Task, start: Date, end: Date) => void;
    onTaskResize?: (task: Task, start: Date, end: Date) => void;
    [key: string]: any;
  }

  export function ReactGantt(props: ReactGanttProps): ReactNode;
}
