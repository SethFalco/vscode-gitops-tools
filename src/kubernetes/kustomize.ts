import {
	DeploymentCondition,
	KubernetesJSON,
	LocalObjectReference,
	KubernetesObject,
	ObjectMeta,
	ResultMetadata
} from './kubernetesTypes';

/**
 * Kustomizations result from running
 * `kubectl get Kustomization -A` command.
 */
export interface KustomizeResult {
	readonly apiVersion: string;
	readonly kind: 'List';
	readonly items: Kustomize[];
	readonly metadata: ResultMetadata;
}

/**
 * Deployment kustomization info object.
 *
 * @see https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/#Deployment
 */
export interface Kustomize extends KubernetesObject {

	// standard kubernetes object fields
	readonly apiVersion: string;
	readonly kind: 'Kustomization'
	readonly metadata: ObjectMeta;

	/**
	 * Deployment kustomization spec details.
	 *
	 * @see https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/#DeploymentSpec
	 * @see https://github.com/fluxcd/kustomize-controller/blob/main/docs/api/kustomize.md#kustomizationspec
	 */
	readonly spec: {

		/**
		 * DependsOn may contain a dependency.CrossNamespaceDependencyReference slice
		 * with references to Kustomization resources that must be ready
		 * before this Kustomization can be reconciled.
		 */
		readonly dependsOn?: DependsOn;

		// Decrypt Kubernetes secrets before applying them on the cluster
		readonly decryption?: Decryption;

		// The interval at which to reconcile the Kustomization
		readonly interval: string;

		/**
		 * The interval at which to retry a previously failed reconciliation.
		 * When not specified, the controller uses the KustomizationSpec.Interval value
		 * to retry failures.
		 */
		readonly retryInterval?: string

		// KubeConfig references a Kubernetes secret that contains a kubeconfig file
		readonly kubeConfig?: KubeConfig;

		/**
		 * Path to the directory containing the kustomization.yaml file,
		 * or the set of plain YAMLs a kustomization.yaml should be generated for.
		 * Defaults to ‘None’, which translates to the root path of the SourceRef.
		 */
		readonly path?: string;

		/**
		 * PostBuild describes which actions to perform on the YAML manifest
		 * generated by building the kustomize overlay.
		 */
		readonly postBuild?: PostBuild;

		// Prune enables garbage collection
		readonly prune: boolean;

		// A list of resources to be included in the health assessment
		readonly healthChecks?: NamespacedObjectKindReference[];

		/**
		 * Strategic merge and JSON patches, defined as inline YAML objects,
		 * capable of targeting objects based on kind, label and annotation selectors.
		 */
		readonly patches?: Patch[];

		// Strategic merge patches, defined as inline YAML objects
		readonly patchesStrategicMerge?: KubernetesJSON;

		// JSON 6902 patches, defined as inline YAML objects
		readonly patchesJson6902?: JSON6902Patch[];

		/**
		 * Images is a list of (image name, new name, new tag or digest)
		 * for changing image names, tags or digests.
		 * This can also be achieved with a patch,
		 * but this operator is simpler to specify.
		 */
		readonly images?: Image[];

		/**
		 * The name of the Kubernetes service account to impersonate when
		 * reconciling this Kustomization.
		 */
		readonly serviceAccountName?: string;

		// Reference of the source where the kustomization file is
		readonly sourceRef: NamespacedObjectKindReference;

		/**
		 * This flag tells the controller to suspend subsequent kustomize executions,
		 * it does not apply to already started executions. Defaults to false.
		 */
		readonly suspend?: boolean;

		// TargetNamespace sets or overrides the namespace in the kustomization.yaml file
		readonly targetNamespace?: string;

		/**
		 * Timeout for validation, apply and health checking operations.
		 * Defaults to ‘Interval’ duration.
		 */
		readonly timeout?: string;

		/**
		 * Force instructs the controller to recreate resources when patching fails
		 * due to an immutable field change.
		 */
		readonly force?: boolean;
	}

	/**
	 * Deployment kustomization status.
	 *
	 * @see https://github.com/fluxcd/kustomize-controller/blob/main/docs/api/kustomize.md#kustomizationstatus
	 */
	readonly status: {
		// ObservedGeneration is the last reconciled generation
		readonly observedGeneration?: number;

		readonly conditions?: DeploymentCondition[];

		// The last successfully applied revision. The revision format for Git sources is
		readonly lastAppliedRevision?: string;

		// LastAttemptedRevision is the revision of the last reconciliation attempt
		readonly lastAttemptedRevision?: string;

		/**
		 * @see https://pkg.go.dev/github.com/fluxcd/pkg/apis/meta?utm_source=godoc#ReconcileRequestStatus
		 */
		// readonly ReconcileRequestStatus?: // TODO: is this commented out to define later ???

		// The last successfully applied revision metadata
		readonly snapshot: Snapshot;
	}
}

/**
 * PostBuild describes which actions to perform on the YAML manifest
 * generated by building the kustomize overlay.
 */
interface PostBuild {

	/**
	 * Substitute holds a map of key/value pairs.
	 * The variables defined in your YAML manifests that match any
	 * of the keys defined in the map will be substituted with the set value.
	 * Includes support for bash string replacement functions
	 * e.g. ${var:=default}, ${var:position} and ${var/substring/replacement}.
	 */
	readonly substitute?: Record<string, string>;

	readonly substituteFrom?: {

		// Kind of the values referent, valid values are (‘Secret’, ‘ConfigMap’)
		readonly kind: string;

		/**
		 * Name of the values referent.
		 * Should reside in the same namespace as the referring resource.
		 */
		readonly name: string;
	}
}

export interface DependsOn {

	// Name holds the name reference of a dependency
	readonly name: string;

	// Namespace holds the namespace reference of a dependency
	readonly namespace?: string;
}

interface Decryption {

	// Provider is the name of the decryption engine
	readonly provider: string;

	// The secret name containing the private OpenPGP keys used for decryption
	readonly secretRef?: LocalObjectReference;
}

export interface NamespacedObjectKindReference {

	// API version of the referent
	readonly apiVersion?: string;

	// Kind of the referent
	readonly kind: string;

	// Name of the referent
	readonly name: string;

	// Namespace of the referent, defaults to the Kustomization namespace
	readonly namespace?: string;
}

declare interface JSON6902Patch {
	readonly patch: JSON6902[];
	readonly target: Selector;
}

declare interface JSON6902 {
	readonly op: string;
	readonly path: string;
	readonly from?: string;
	readonly value?: KubernetesJSON;
}

interface Patch {
	readonly patch?: string;
	readonly target?: Selector;
}

interface Selector {
	readonly group?: string;
	readonly version?: string;
	readonly kind?: string;
	readonly namespace?: string;
	readonly name?: string;
	readonly annotationSelector?: string;
	readonly labelSelector?: string;
}

interface Image {

	// Name is a tag-less image name
	readonly name: string;

	// NewName is the value used to replace the original name
	readonly newName?: string;

	// NewTag is the value used to replace the original tag
	readonly newTag?: string;

	// Digest is the value used to replace the original image tag
	readonly digest?: string;
}

interface Snapshot {

	// The manifests sha1 checksum
	readonly checksum: string;

	// A list of Kubernetes kinds grouped by namespace
	readonly entries: {
		// The namespace of this entry
		readonly namespace?: string;

		// The list of Kubernetes kinds
		readonly kinds: Record<string, string>;
	}[]
}

export interface KubeConfig {

	/**
	 * SecretRef holds the name to a secret that contains a ‘value’ key
	 * with the kubeconfig file as the value. It must be in the same namespace
	 * as the Kustomization. It is recommended that the kubeconfig is self-contained,
	 * and the secret is regularly updated if credentials such as
	 * a cloud-access-token expire. Cloud specific cmd-path auth helpers
	 * will not function without adding binaries and credentials to the Pod
	 * that is responsible for reconciling the Kustomization.
	 */
	readonly secretRef: LocalObjectReference;
}
