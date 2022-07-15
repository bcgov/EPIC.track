package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonObject;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.commons.connector.HTTPServiceInvoker;
import org.camunda.bpm.extension.hooks.exceptions.FormioServiceException;
import org.camunda.bpm.extension.hooks.listeners.data.FormElement;
import org.camunda.bpm.extension.hooks.services.FormSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.springframework.beans.factory.annotation.Value;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import javax.inject.Named;
import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This is a custom class to invoke Sync API and tranforms form data into CAM
 * variables
 * 
 * @author Sneha Suresh
 */
@Named("SyncFormDataPipelineListener")
public class SyncFormDataPipelineListener extends BaseListener implements TaskListener, ExecutionListener {

	private final Logger LOGGER = Logger.getLogger(SyncFormDataPipelineListener.class.getName());

	@Autowired
	private HTTPServiceInvoker httpServiceInvoker;

	@Autowired
	private FormSubmissionService formSubmissionService;

	@Autowired
	private WebClient webClient;

	@Value("${report.url}")
	private String reportUrl;

	@Override
	public void notify(DelegateExecution execution) {
		try {
			patchFormAttributes(execution);
		} catch (IOException e) {
			handleException(execution, ExceptionSource.EXECUTION, e);
		}
	}

	@Override
	public void notify(DelegateTask delegateTask) {
		try {
			patchFormAttributes(delegateTask.getExecution());
		} catch (IOException e) {
			handleException(delegateTask.getExecution(), ExceptionSource.TASK, e);
		}
	}

	/**
	 * This method invokes the HTTP service invoker for patch.
	 *
	 * @param execution
	 */
	private void patchFormAttributes(DelegateExecution execution) throws IOException {
		String formUrl = MapUtils.getString(execution.getVariables(), "formUrl", null);
		if (StringUtils.isBlank(formUrl)) {
			LOGGER.log(Level.SEVERE, "Unable to read submission for " + execution.getVariables().get("formUrl"));
			return;
		}
		ResponseEntity<String> response = httpServiceInvoker.execute(getUrl(execution), HttpMethod.PATCH,
				getModifiedCustomFormElements(execution));
		if (response.getStatusCodeValue() != HttpStatus.OK.value()) {
			throw new FormioServiceException(
					"Unable to get patch values for: " + formUrl + ". Message Body: " + response.getBody());
		}
	}

	/**
	 * Prepares and returns Modified Custom Form Elements.
	 *
	 * @param execution
	 * @return
	 */
	private Set<FormElement> getModifiedCustomFormElements(DelegateExecution execution) throws IOException {
		Set<FormElement> elements = new LinkedHashSet<>();
		JsonNode data = prepareSyncData(execution);
		DocumentContext jsonContext = JsonPath.parse(invokeSyncApplicationService(execution));
		Iterator<String> iterator = data.fieldNames();
		iterator.forEachRemaining(entry -> {
			JsonNode jsonData = data.get(entry);
			if (jsonData != null && jsonData.isArray()) {
				for (int i = 0; i < jsonData.size(); i++) {
					if (jsonData.get(i).has("id")) {
						String jsonPath = "$." + entry + "[" + i + "]" + ".id";
						Integer elementValue = jsonContext.read(jsonPath);
						elements.add(new FormElement(entry + "/" + i + "/id", String.valueOf(elementValue)));
					}
					readInnerDataElements(i, jsonData, elements, entry, jsonContext);
				}
			} else if (jsonData.has("id") && jsonData.isObject()) {
				String jsonPath = "$." + entry + ".id";
				Integer elementValue = jsonContext.read(jsonPath);
				elements.add(new FormElement(entry + "/id", String.valueOf(elementValue)));
			}
		});
		LOGGER.info("Patch Elements : " + elements);
		return elements;
	}

	private void readInnerDataElements(int i, JsonNode jsonData, Set<FormElement> elements, String entry,
			DocumentContext jsonContext) {
		Iterator<String> iterateData = jsonData.get(i).fieldNames();
		iterateData.forEachRemaining(innerEntry -> {
			JsonNode nestedData = jsonData.get(i).get(innerEntry);
			if (nestedData != null && nestedData.isArray()) {
				for (int j = 0; j < nestedData.size(); j++) {
					if (nestedData.get(j).has("id")) {
						String jsonPath = "$." + entry + "[" + i + "]" + "." + innerEntry + "[" + j + "]" + ".id";
						Integer innerElementValue = jsonContext.read(jsonPath);
						elements.add(new FormElement(entry + "/" + i + "/" + innerEntry + "/" + j + "/" + "id",
								String.valueOf(innerElementValue)));
					}
				}
			} else if (nestedData.has("id") && nestedData.isObject()) {
				String jsonPath = "$." + entry + "[" + i + "]" + "." + innerEntry + ".id";
				Integer innerElementValue = jsonContext.read(jsonPath);
				elements.add(new FormElement(entry + "/" + i + "/" + innerEntry + "/id", String.valueOf(innerElementValue)));
			}
		});
	}

	/**
	 * This method invokes Sync API and returns the response.
	 *
	 * @param execution
	 * @return
	 */
	private String invokeSyncApplicationService(DelegateExecution execution) throws IOException {
		Object dataJson = prepareSyncData(execution);
		String payload = dataJson != null ? new ObjectMapper().writeValueAsString(dataJson) : null;
		payload = (dataJson == null) ? new JsonObject().toString() : payload;
		LOGGER.info("ReportAPI Payload : " + payload);
		Mono<ResponseEntity<String>> entityMono = webClient.method(HttpMethod.POST).uri(getSyncApplicationUrl())
				.accept(MediaType.APPLICATION_JSON).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
				.body(Mono.just(payload), String.class).retrieve().toEntity(String.class);

		ResponseEntity<String> response = entityMono.block();
		LOGGER.info("ReportAPI Response : " + response.getBody());
		return response.getBody();
	}

	/**
	 * Prepares and returns the Form Data Elements.
	 *
	 * @param execution
	 * @return
	 */
	private JsonNode prepareSyncData(DelegateExecution execution) throws IOException {
		String submission = formSubmissionService.readSubmission(getUrl(execution));
		LOGGER.info("Formio Response : " + submission);
		if (submission.isEmpty()) {
			throw new RuntimeException("Unable to retrieve submission");
		}
		JsonNode dataNode = new ObjectMapper().readTree(submission);
		JsonNode dataElements = dataNode.findValue("data");
		return dataElements;
	}

	private String getUrl(DelegateExecution execution) {
		return String.valueOf(execution.getVariables().get("formUrl"));
	}

	/**
	 * Returns the endpoint of Sync API.
	 *
	 * @return
	 */
	private String getSyncApplicationUrl() {
		return this.reportUrl + "/sync-form-data";
	}

}
