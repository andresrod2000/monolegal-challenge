namespace Monolegal.Domain.Errors;

public class DomainError(string message) : Exception(message);

public class ClientValidationError(string message) : DomainError(message);

public class ClientNotFoundError(string message) : DomainError(message);

public class ClientHasInvoicesError(string message) : DomainError(message);

public class InvoiceValidationError(string message) : DomainError(message);

public class InvoiceNotFoundError(string message) : DomainError(message);

public class InvoiceTransitionError(string message) : DomainError(message);
