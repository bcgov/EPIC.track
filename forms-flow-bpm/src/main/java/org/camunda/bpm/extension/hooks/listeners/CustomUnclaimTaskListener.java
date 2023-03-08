package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.engine.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Named;
import java.util.List;

@Named("CustomUnclaimTaskListener")
public class CustomUnclaimTaskListener extends BaseListener implements TaskListener, ExecutionListener {

    private final Logger LOGGER = LoggerFactory.getLogger(CustomUnclaimTaskListener.class);

    @Override
    public void notify(DelegateExecution execution) {
        unclaimTask(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        unclaimTask(delegateTask.getExecution());
    }

    private void unclaimTask(DelegateExecution execution) {

        List<Task> taskList = execution.getProcessEngine().getTaskService().createTaskQuery().taskAssigned().list();

        for (Task task : taskList) {
            String taskId = task.getId();
            LOGGER.debug(taskId + "Task ID : ");
            execution.getProcessEngine().getTaskService().setAssignee(taskId, null);
        }
    }
}
