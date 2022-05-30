package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.inject.Named;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * This Custom class transforms the form document data into CAM variables
 *
 * @author Sneha Suresh
 */
@Named("CustomFormBPMDataPipelineListener")
public class CustomFormBPMDataPipelineListener extends BaseListener implements TaskListener, ExecutionListener {

	@Autowired
	private FormSubmissionService formSubmissionService;

	@Override
	public void notify(DelegateExecution execution) {
		try {
			syncFormVariables(execution);
		} catch (IOException e) {
			handleException(execution, ExceptionSource.EXECUTION, e);
		}
	}

	@Override
	public void notify(DelegateTask delegateTask) {
		try {
			syncFormVariables(delegateTask.getExecution());
		} catch (IOException e) {
			handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
		}
	}

	private void syncFormVariables(DelegateExecution execution) throws IOException {
		List<String> whiteListedKeys = new ArrayList<String>();
		whiteListedKeys.add("applicationId");
		whiteListedKeys.add("applicationStatus");
		whiteListedKeys.add("formName");
		whiteListedKeys.add("formUrl");
		whiteListedKeys.add("works");
		whiteListedKeys.add("workTitle");
		whiteListedKeys.add("work_type_id");
		whiteListedKeys.add("actionType");
		whiteListedKeys.add("isworkterminated");
		whiteListedKeys.add("inspections");
		Map<String, Object> dataMap = formSubmissionService
				.retrieveFormValues(String.valueOf(execution.getVariables().get("formUrl")));
		for (Map.Entry<String, Object> entry : dataMap.entrySet()) {
			if (whiteListedKeys.contains(entry.getKey())) {
				execution.setVariable(entry.getKey(), entry.getValue());
			}
		}
	}
}
