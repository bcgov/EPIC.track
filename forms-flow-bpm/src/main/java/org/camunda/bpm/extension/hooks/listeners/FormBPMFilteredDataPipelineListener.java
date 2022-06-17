package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.nimbusds.jose.shaded.json.parser.ParseException;

import org.apache.commons.lang.ObjectUtils.Null;
import org.springframework.beans.factory.annotation.Value;
import org.apache.commons.lang3.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.commons.ro.res.IResponse;
import org.camunda.bpm.extension.hooks.exceptions.ApplicationServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.FilterInfo;
import org.camunda.bpm.extension.hooks.listeners.data.FormProcessMappingData;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.w3c.dom.Text;

import javax.annotation.Resource;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Map.Entry;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.APPLICATION_ID;
import static org.camunda.bpm.extension.commons.utils.VariableConstants.FORM_URL;

/**
 * Form BPM Filtered Data Pipeline Listener. This class copies specific data
 * from form document data into CAM variables.
 */

@Component
public class FormBPMFilteredDataPipelineListener extends BaseListener implements TaskListener, ExecutionListener {

	private static final Logger LOGGER = LoggerFactory.getLogger(FormBPMFilteredDataPipelineListener.class);

	@Resource(name = "bpmObjectMapper")
	private ObjectMapper bpmObjectMapper;
	@Autowired
	private FormSubmissionService formSubmissionService;
	@Autowired
	private HTTPServiceInvoker httpServiceInvoker;
	
	@Value("${formsflow.ai.formio.url}")
	private String formioUrl;

	@Override
	public void notify(DelegateExecution execution) {
		try {
			try {
				syncFormVariables(execution);
			} catch (ParseException e) {
				e.printStackTrace();
			}
		} catch (IOException | ApplicationServiceException e) {
			handleException(execution, ExceptionSource.EXECUTION, e);
		}
	}

	@Override
	public void notify(DelegateTask delegateTask) {
		try {
			try {
				syncFormVariables(delegateTask.getExecution());
			} catch (ParseException e) {
				e.printStackTrace();
			}
		} catch (IOException | ApplicationServiceException e) {
			handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
		}
	}

	private void syncFormVariables(DelegateExecution execution) throws IOException, ParseException {
		ResponseEntity<IResponse> response = httpServiceInvoker.execute(getApplicationUrl(execution), HttpMethod.GET,
				null, FormProcessMappingData.class);
		if (response.getStatusCodeValue() != HttpStatus.OK.value()) {
			throw new ApplicationServiceException(
					"Unable to update application " + ". Message Body: " + response.getBody());
		}
		FormProcessMappingData body = (FormProcessMappingData) response.getBody();
		if (body != null) {
			List<FilterInfo> filterInfoList = Arrays.asList(body.getTaskVariableList(bpmObjectMapper));
			Map<String, FilterInfo> filterInfoMap = filterInfoList.stream()
					.collect(Collectors.toMap(FilterInfo::getKey, Function.identity()));

			if (!filterInfoMap.isEmpty()) {
				String submission = formSubmissionService
						.readSubmission(getUrl(execution));
				DocumentContext jsonContext = JsonPath.parse(submission);
				for (Map.Entry<String, FilterInfo> entry : filterInfoMap.entrySet()) {
					if (entry.getValue() != null) {
						String jsonPath = "$.data." + entry.getKey();
						Object entryValue = jsonContext.read(jsonPath);
						if (entryValue != null) {
							execution.setVariable(entry.getValue().getLabel(),
									convertToOriginType(entryValue));
						}
					}
				}
			}
		}
	}

	/**
	 * Returns the endpoint of application API.
	 *
	 * @param execution
	 * @return
	 */
	private String getApplicationUrl(DelegateExecution execution) {
		return httpServiceInvoker.getProperties().getProperty("api.url") + "/form/applicationid/"
				+ execution.getVariable(APPLICATION_ID);
	}
	
	private String getUrl(DelegateExecution execution) {
		String formUrl = String.valueOf(execution.getVariables().get(FORM_URL));
		String modifiedUri = StringUtils.substringAfter(formUrl, "/form/");
		return this.formioUrl + "/form/" + modifiedUri;
	}

	private Object convertToOriginType(Object value) throws IOException {
		Object fieldValue;
		if (value instanceof Null) {
			fieldValue = null;
		} else if (value instanceof Boolean) {
			fieldValue = ((Boolean) value).booleanValue();
		} else if (value instanceof Integer) {
			fieldValue = ((Integer) value).intValue();
		} else if (value instanceof Long) {
			fieldValue = ((Long) value).longValue();
		} else if (value instanceof Double) {
			fieldValue = ((Double) value).doubleValue();
		} else if (value instanceof BigDecimal) {
			fieldValue = ((BigDecimal) value).abs();
		} else if (value instanceof Text) {
			fieldValue = ((Text) value).getWholeText();
		} else {
			fieldValue = value.toString();
		}

		if (Objects.equals(fieldValue, "")) {
			fieldValue = null;
		}

		return fieldValue;
	}
}
