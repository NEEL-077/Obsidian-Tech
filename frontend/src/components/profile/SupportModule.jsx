import React from 'react';
import { LifeBuoy, PlusCircle, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

const SupportModule = ({ tickets, onRaiseTicket }) => {
  return (
    <div className="support-module">
      <div className="module-header">
        <div className="header-text">
          <h2>Support & Help Center</h2>
          <p>Get fast support for your orders, account, or technical issues.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={onRaiseTicket}
        >
          <PlusCircle size={20} /> Raise a Ticket
        </button>
      </div>

      <div className="support-overview">
        <div className="stat-card">
          <MessageSquare size={32} />
          <div className="stat-info">
            <h3>{tickets.length}</h3>
            <p>Total Tickets</p>
          </div>
        </div>
        <div className="stat-card orange">
          <Clock size={32} />
          <div className="stat-info">
            <h3>{tickets.filter(t => t.status === 'open').length}</h3>
            <p>Open Issues</p>
          </div>
        </div>
        <div className="stat-card green">
          <CheckCircle2 size={32} />
          <div className="stat-info">
            <h3>{tickets.filter(t => t.status === 'closed').length}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <div className="tickets-list">
        <h3>Previous Support Tickets</h3>
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-item">
            <div className="ticket-main">
              <div className="ticket-info">
                <span className="ticket-id">#{ticket.id}</span>
                <h4>{ticket.subject}</h4>
                <div className="ticket-meta">
                  <span className="date">Created: {new Date(ticket.date).toLocaleDateString()}</span>
                  <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span>
                </div>
              </div>
              <div className="ticket-status-col">
                <span className={`status-badge ${ticket.status}`}>
                  {ticket.status.toUpperCase()}
                </span>
                <span className="last-update">Update: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="ticket-actions">
              <button className="btn btn-outline btn-sm">View Conversation</button>
              {ticket.status === 'open' && (
                <button className="btn btn-secondary btn-sm">Add Update</button>
              )}
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="empty-state">
            <LifeBuoy size={48} className="empty-icon" />
            <h3>No tickets found</h3>
            <p>Need help? Raise a ticket and our team will get back to you.</p>
          </div>
        )}
      </div>

      <div className="faq-link">
        <LifeBuoy size={20} />
        <span>Still have questions? Check out our <a href="/contact">FAQs</a></span>
      </div>
    </div>
  );
};

export default SupportModule;
